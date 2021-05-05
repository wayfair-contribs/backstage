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

import { renderInTestApp } from '@backstage/test-utils';
import React from 'react';
import { GraphQlDefinitionWidget } from './GraphQlDefinitionWidget';

describe('<GraphQlDefinitionWidget />', () => {
  it('renders graphql schema', async () => {
    const definition = `
"""Hello World!"""
schema {
  query: Film
}

"""A single film."""
type Film {
  """The ID of an object"""
  id: ID!
  """The title of this film."""
  title: String
}
    `;
    // CodeMirror uses features that jsdom doesn't support so we have to patch
    // it here, see: https://github.com/jsdom/jsdom/issues/3002
    document.createRange = () => {
      const range = new Range();

      range.getBoundingClientRect = jest.fn();

      range.getClientRects = () => {
        return {
          item: () => null,
          length: 0,
          [Symbol.iterator]: jest.fn(),
        };
      };

      return range;
    };

    const { getByText } = await renderInTestApp(
      <GraphQlDefinitionWidget definition={definition} graphqlLink={null} />,
    );

    expect(getByText(/Film/i)).toBeInTheDocument();
  });

  it('renders a warning when graphqlLink is null', async () => {
    const definition = `
"""Hello World!"""
schema {
  query: Film
}

"""A single film."""
type Film {
  """The ID of an object"""
  id: ID!
  """The title of this film."""
  title: String
}
    `;
    // CodeMirror uses features that jsdom doesn't support so we have to patch
    // it here, see: https://github.com/jsdom/jsdom/issues/3002
    document.createRange = () => {
      const range = new Range();

      range.getBoundingClientRect = jest.fn();

      range.getClientRects = () => {
        return {
          item: () => null,
          length: 0,
          [Symbol.iterator]: jest.fn(),
        };
      };

      return range;
    };

    const withoutLinkRendered = await renderInTestApp(
      <GraphQlDefinitionWidget definition={definition} graphqlLink={null} />,
    );

    expect(withoutLinkRendered.getByText('Read-Only')).toBeInTheDocument();
  });

  it('does not render a warning when graphqlLink is not null', async () => {
    const definition = `
"""Hello World!"""
schema {
  query: Film
}

"""A single film."""
type Film {
  """The ID of an object"""
  id: ID!
  """The title of this film."""
  title: String
}
    `;
    // CodeMirror uses features that jsdom doesn't support so we have to patch
    // it here, see: https://github.com/jsdom/jsdom/issues/3002
    document.createRange = () => {
      const range = new Range();

      range.getBoundingClientRect = jest.fn();

      range.getClientRects = () => {
        return {
          item: () => null,
          length: 0,
          [Symbol.iterator]: jest.fn(),
        };
      };

      return range;
    };

    const withLinkRendered = await renderInTestApp(
      <GraphQlDefinitionWidget definition={definition} graphqlLink="test" />,
    );

    expect(withLinkRendered.getByText('Read-Only')).not.toBeInTheDocument();
  });
});
