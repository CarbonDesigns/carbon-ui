# CDN layout
The CDN layout is the following.

## /target/*
Contains the compiled app, html, css

## /fonts/*
Contains the fonts from the carbon-fonts repository.

## /img/*
Contains the build-in resource images - avatars, backgrounds, etc.
These images are not used in css.

## /resources/*
Contains the built-in resources from this repository.

# DEV server
The dev server maps the same structure. All requests to /resources are redirected to the /target folder, where the required resources should be placed.

In the release mode, backend.cdnEndpoint points to the real CDN root, in DEV server it's empty.
So all that's needed in code is writing:
```
backend.cdnEndpoint + url
```