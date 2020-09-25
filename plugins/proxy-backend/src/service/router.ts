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

import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import createProxyMiddleware, {
  Config as ProxyMiddlewareConfig,
  Proxy,
} from 'http-proxy-middleware';
import { Logger } from 'winston';
import http from 'http';
import { PluginEndpointDiscovery } from '@backstage/backend-common';

export interface RouterOptions {
  logger: Logger;
  config: Config;
  discovery: PluginEndpointDiscovery;
}

export interface ProxyConfig extends ProxyMiddlewareConfig {
  allowedMethods?: string[];
}

// Creates a proxy middleware, possibly with defaults added on top of the
// given config.
function buildMiddleware(
  pathPrefix: string,
  logger: Logger,
  route: string,
  config: string | ProxyConfig,
): Proxy {
  const fullConfig =
    typeof config === 'string' ? { target: config } : { ...config };

  // Default is to do a path rewrite that strips out the proxy's path prefix
  // and the rest of the route.
  if (fullConfig.pathRewrite === undefined) {
    const routeWithSlash = route.endsWith('/') ? route : `${route}/`;
    fullConfig.pathRewrite = {
      [`^${pathPrefix}${routeWithSlash}`]: '/',
    };
  }

  // Default is to update the Host header to the target
  if (fullConfig.changeOrigin === undefined) {
    fullConfig.changeOrigin = true;
  }

  // Attach the logger to the proxy config
  fullConfig.logProvider = () => logger;

  // Only permit the allowed HTTP methods if configured
  const filter = (_pathname: string, req: http.IncomingMessage): boolean => {
    return fullConfig?.allowedMethods?.includes(req.method!) ?? true;
  };

  return createProxyMiddleware(filter, fullConfig);
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = Router();

  const externalUrl = await options.discovery.getExternalBaseUrl('proxy');
  const { pathname: pathPrefix } = new URL(externalUrl);

  const proxyConfig = options.config.getOptional('proxy') ?? {};
  Object.entries(proxyConfig).forEach(([route, proxyRouteConfig]) => {
    router.use(
      route,
      buildMiddleware(pathPrefix, options.logger, route, proxyRouteConfig),
    );
  });

  return router;
}
