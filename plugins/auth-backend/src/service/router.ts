/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import express from 'express';
import Router from 'express-promise-router';
import cookieParser from 'cookie-parser';
import Knex from 'knex';
import { Logger } from 'winston';
import { createAuthProviderRouter } from '../providers';
import { Config } from '@backstage/config';
import { DatabaseKeyStore, TokenFactory, createOidcRouter } from '../identity';
import {
  NotFoundError,
  PluginEndpointDiscovery,
} from '@backstage/backend-common';

export interface RouterOptions {
  logger: Logger;
  database: Knex;
  config: Config;
  discovery: PluginEndpointDiscovery;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = Router();
  const logger = options.logger.child({ plugin: 'auth' });

  const appUrl = options.config.getString('app.baseUrl');
  const authUrl = await options.discovery.getExternalBaseUrl('auth');

  const keyDurationSeconds = 3600;

  const keyStore = await DatabaseKeyStore.create({
    database: options.database,
  });
  const tokenIssuer = new TokenFactory({
    issuer: authUrl,
    keyStore,
    keyDurationSeconds,
    logger: logger.child({ component: 'token-factory' }),
  });

  router.use(cookieParser());
  router.use(express.urlencoded({ extended: false }));
  router.use(express.json());

  const providersConfig = options.config.getConfig('auth.providers');
  const providers = providersConfig.keys();

  for (const providerId of providers) {
    logger.info(`Configuring provider, ${providerId}`);
    try {
      const providerConfig = providersConfig.getConfig(providerId);
      const providerRouter = createAuthProviderRouter(
        providerId,
        { baseUrl: authUrl, appUrl },
        providerConfig,
        logger,
        tokenIssuer,
      );
      router.use(`/${providerId}`, providerRouter);
    } catch (e) {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error(
          `Failed to initialize ${providerId} auth provider, ${e.message}`,
        );
      }

      logger.warn(`Skipping ${providerId} auth provider, ${e.message}`);
    }
  }

  router.use(
    createOidcRouter({
      tokenIssuer,
      baseUrl: authUrl,
    }),
  );

  router.use('/:provider/', req => {
    const { provider } = req.params;
    throw new NotFoundError(`No auth provider registered for '${provider}'`);
  });

  return router;
}
