// For basic information about service wrkers please visit:
//
// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
//
// or:
//
// https://developers.google.com/web/fundamentals/primers/service-workers/

// This is a cache name, it should be unique for every project,
const CACHE_NAME = "mw-cache";

// This is the path to the offline page.
const OFFLINE_PAGE = "/404.html";

// List of pre-cached files. It should include base path (/),
// home page of the wiki (/w/Home) and some offline page which
// contains info about lost internet connection and a link
// to home page (/offline.html).


const CACHE_FILES = [
  "/",
  OFFLINE_PAGE
];

// We want to cache only articles. So this is a regular expression
// that matches the article path (/w/Article_name).
// This works only if you have short URLs enabled on your wiki, see:
// https://www.mediawiki.org/wiki/Manual:Short_URL
// const PATH_REGEXP = new RegExp("^\\/wiki\\/");

// When you visit the wiki for the first time,
// the list CACHE_FILES will be pre-cached for further usage. See:
// https://developers.google.com/web/fundamentals/primers/service-workers/#install_a_service_worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(CACHE_FILES);
      })
  );
});

// When you click any link, we want to serve some content:
//  1. if you are online, just serve online content and cache it.
//  2. if you are offline,
//   2a. serve cached content retrieved when you were online, or
//   2b. serve some useful and pre-cached offline page
//
// (2a) applies only to main namespace articles in the PATH_REGEXP folder.
// Other content will be served only online.
// See:
// https://developers.google.com/web/fundamentals/primers/service-workers/#cache_and_return_requests
self.addEventListener("fetch", event => {
  // console.log('[TRY] ' + event.request.url)
  event.respondWith(
    fetch(event.request, { 
      // credentials: "include" 
    })
      .then(response => {
        // console.log('[SUCCESS] ' + event.request.url)
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        let requestClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => { cache.put(event.request, requestClone); });
        return response;
      })
      .catch(() => {
        // console.log('[FAILED] ' + event.request.url)
        return caches.match(event.request)
          .then(response => {
            // console.log('[CACHE][GOT] ' + event.request.url)
            if (response) {
              // console.log('[CACHE][HIT] ' + event.request.url)
              return response;
            }
            else if (event.request.headers.get("Accept").includes("text/html")) {
              // console.log('[CACHE][MISS][offline] ' + event.request.url)
              return caches.match(OFFLINE_PAGE);
            }
            else {
              // console.log('[CACHE][MISS][---] ' + event.request.url)
            }
          })
          .catch(() => {
            // console.log('[CACHE][FAILED] ' + event.request.url)
          })
      }));
});

// If you ever change your service worker and change your cache name,
// you certainly want to delete the old cache. See:
// https://developers.google.com/web/fundamentals/primers/service-workers/#update-a-service-worker
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cache_names => {
      return Promise.all(
        cache_names.map(cache_unit => {
          if (cache_unit !== CACHE_NAME)
            return caches.delete(cache_unit);
        })
      );
    })
  );
});