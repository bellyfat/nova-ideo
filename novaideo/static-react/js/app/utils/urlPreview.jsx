/* eslint-disable no-param-reassign, guard-for-in, no-restricted-syntax */
// @flow
import React from 'react';
import type { Node } from 'react';

import YoutubeEmbed from '../components/common/urlPreview/YoutubeEmbed';
import SketchFabEmbed from '../components/common/urlPreview/SketchFabEmbed';
import { urlMetadataUrl } from '../client';

type URLMetadataProps = {
  providerName: string,
  html: string,
  id: string
};

export type Script = {
  src: string,
  type: 'url' | 'js'
};

const PICTURES = ['thumbnailUrl', 'authorAvatar', 'faviconUrl'];

export const EMBED_PROVIDERS = {
  youtube: {
    scheme: /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i,
    match: (url: string) => {
      return url.match(EMBED_PROVIDERS.youtube.scheme);
    },
    getMetadata: (url: string): URLMetadataProps | null => {
      const result = EMBED_PROVIDERS.youtube.match(url);
      if (result) {
        const id = result[1];
        const embedUrl = `https://www.youtube.com/embed/${id}`;
        return {
          providerName: 'Youtube',
          html: `<div><iframe title="" src="${embedUrl}" frameborder="0" class="embedded-video"
                              allowfullscreen data-source-url="${url}"></iframe></div>`,
          id: id
        };
      }
      return null;
    },
    getComponent: (url: string): Node | null => {
      const result = EMBED_PROVIDERS.youtube.match(url);
      return result ? <YoutubeEmbed id={result[1]} /> : null;
    }
  },
  sketchfab: {
    scheme: /(?:((sketchfab\.com\/show|models)|skfb\.ly)\/(.*))/i,
    match: (url: string) => {
      return url.match(EMBED_PROVIDERS.sketchfab.scheme);
    },
    getMetadata: (url: string): URLMetadataProps | null => {
      const result = EMBED_PROVIDERS.sketchfab.match(url);
      if (result) {
        const isSkfb = result[1] === 'skfb.ly';
        const id = result[3];
        const embedUrl = isSkfb
          ? `${url}?autostart=1&autospin=0.5`
          : `https://sketchfab.com/models/${id}/embed?autostart=1&autospin=0.5`;

        return {
          providerName: 'Sketchfab',
          html: `<div><iframe title="" src="${embedUrl}" frameborder="0" class="embedded-video"
                              allowfullscreen data-source-url="${url}"></iframe></div>`,
          id: id
        };
      }
      return null;
    },
    getComponent: (url: string): Node | null => {
      const result = EMBED_PROVIDERS.sketchfab.match(url);
      return result ? <SketchFabEmbed url={url} /> : null;
    }
  }
  // add ...
};

/**
 * Resize the iframe height when her content is changed
 * @param {id: string} The iframe id
 * @param {callback: ?Function} Called when the iframe is resized
 */
export function resizeIframe(id: string, callback: ?Function): void {
  const iframe = document.getElementById(id);
  if (iframe && iframe instanceof HTMLIFrameElement) {
    const doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow && iframe.contentWindow.document;
    if (doc && doc.body) {
      const body = doc.body;
      const height = Math.max(body.scrollHeight, body.offsetHeight);
      iframe.style.height = `${height + 50}px`;
      // callback after resize
      if (callback) callback();
      // call resizeIframe again if the subtree of the iframe document is changed
      const resizeIframeCall = () => {
        resizeIframe(id, callback);
        body.removeEventListener('DOMSubtreeModified', resizeIframeCall);
      };
      body.addEventListener('DOMSubtreeModified', resizeIframeCall);
    }
  }
}

/**
 * Return the scripts URLs present in an HTML
 * @param {html: string} The HTML code
 * @returns {Array<string>} List of the scripts URLs
 */
export function getScripts(html: string): Array<Script> {
  const d = document.createElement('div');
  d.innerHTML = html;
  return Array.from(d.getElementsByTagName('script')).map((script: HTMLScriptElement) => {
    const src = script.getAttribute('src');
    return src ? { src: src, type: 'url' } : { src: script.innerHTML, type: 'js' };
  });
}

/**
 * Return a HTML document structure
 * @param {header: string} The HTML header to include to the document
 * @returns {string} The HTML document
 */
export function getIframeDocument(header: string): string {
  return `<!DOCTYPE html><html>
          <head>${header} <style type='text/css'>iframe { width: 100% !important} </style></head>
          <body><div id='htmlmount'></div></body></html>`;
}

/**
 * @param {url: string} The source URL
 * @returns {URLMetadataProps|null} The URL metadata or null
 */
export function getURLMetadata(url: string): URLMetadataProps | null {
  for (const key in EMBED_PROVIDERS) {
    const provider = EMBED_PROVIDERS[key];
    const metadata = provider.getMetadata(url);
    if (metadata) return metadata;
  }
  return null;
}

/**
 * @param {url: string} The source URL
 * @returns {Node|null} The component to be displayed or null
 */
export function getURLComponent(url: string): Node | null {
  for (const key in EMBED_PROVIDERS) {
    const provider = EMBED_PROVIDERS[key];
    const component = provider.getComponent(url);
    if (component) return component;
  }
  return null;
}

export function updateMetadataImagesUrls(urlMetadata: Object | null): Object | null {
  if (!urlMetadata) {
    return urlMetadata;
  }
  const updatedMetadata = { ...urlMetadata };
  Object.keys(updatedMetadata).forEach((key) => {
    if (PICTURES.includes(key)) {
      updatedMetadata[key] = updatedMetadata[key] ? `${urlMetadataUrl}${updatedMetadata[key]}` : null;
    }
  });
  return updatedMetadata;
}