## API Report File for "@backstage/plugin-tech-radar"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { ApiRef } from '@backstage/core-plugin-api';
import { BackstagePlugin } from '@backstage/core-plugin-api';
import { RouteRef } from '@backstage/core-plugin-api';

// @public (undocumented)
export interface RadarEntry {
    // (undocumented)
    description?: string;
    // (undocumented)
    id: string;
    // (undocumented)
    key: string;
    // (undocumented)
    quadrant: string;
    // (undocumented)
    timeline: Array<RadarEntrySnapshot>;
    // (undocumented)
    title: string;
    // (undocumented)
    url: string;
}

// @public (undocumented)
export interface RadarEntrySnapshot {
    // (undocumented)
    date: Date;
    // (undocumented)
    description?: string;
    // (undocumented)
    moved?: MovedState;
    // (undocumented)
    ringId: string;
}

// @public (undocumented)
export interface RadarQuadrant {
    // (undocumented)
    id: string;
    // (undocumented)
    name: string;
}

// @public (undocumented)
export interface RadarRing {
    // (undocumented)
    color: string;
    // (undocumented)
    id: string;
    // (undocumented)
    name: string;
}

// @public (undocumented)
export const Router: {
    ({ title, subtitle, pageTitle, ...props }: TechRadarPageProps): JSX.Element;
    defaultProps: {
        title: string;
        subtitle: string;
        pageTitle: string;
    };
};

// @public (undocumented)
export interface TechRadarApi {
    load: (id: string | undefined) => Promise<TechRadarLoaderResponse>;
}

// @public (undocumented)
export const techRadarApiRef: ApiRef<TechRadarApi>;

// @public (undocumented)
export const TechRadarComponent: (props: TechRadarComponentProps) => JSX.Element;

// @public (undocumented)
export interface TechRadarComponentProps {
    // (undocumented)
    height: number;
    // (undocumented)
    id?: string;
    // (undocumented)
    svgProps?: object;
    // (undocumented)
    width: number;
}

// @public (undocumented)
export interface TechRadarLoaderResponse {
    // (undocumented)
    entries: RadarEntry[];
    // (undocumented)
    quadrants: RadarQuadrant[];
    // (undocumented)
    rings: RadarRing[];
}

// @public (undocumented)
export const TechRadarPage: {
    ({ title, subtitle, pageTitle, ...props }: TechRadarPageProps): JSX.Element;
    defaultProps: {
        title: string;
        subtitle: string;
        pageTitle: string;
    };
};

// @public (undocumented)
const techRadarPlugin: BackstagePlugin<{
    root: RouteRef<undefined>;
}, {}>;

export { techRadarPlugin as plugin }

export { techRadarPlugin }


// (No @packageDocumentation comment for this package)

```
