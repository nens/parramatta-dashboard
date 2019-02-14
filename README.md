Parramatta Dashboard
====================

This is the React/Redux-based dashboard web-app for the City of Parramatta.

![Screenshot](https://raw.githubusercontent.com/nens/parramatta-dashboard/master/screenshot.jpg?token=AAAcGVz1I1unGIxeRJNHrvlTKk8P4mL8ks5Z4Ly2wA%3D%3D)

Installation
============

- Required: A working nodejs and yarn installation
- (temporarily, until release of lizard-api-client) make sure that you have the github repository `lizard-api-client` as a folder parallel to the root directory of this repository, see [lizard-api-client](https://github.com/nens/lizard-api-client)

- Inside `lizard-api-client` repository: do `$ yarn install` followed by `$ npm run start` 

- In the root directory of this repository (parramatta-dashboard): do
- `$ npm link lizard-api-client`
- `$ yarn install`
- ...followed by either `$ ./start`
or `$ PROXY_USERNAME=<your_sso_username> PROXY_PASSWORD=<your_sso_password> yarn start`


create-react-app
================

The base skeleton for this project was generated using [create-react-app](https://github.com/facebookincubator/create-react-app).


Development
===========

A pre-commit hook is configured to run [Prettier.js](https://github.com/prettier/prettier) every time, so the codebase stays in consistent form, style-wise.

If you work on this project, please submit changes via Pull Requests and follow the [commit guidelines as outlined here](https://github.com/conventional-changelog/standard-version#commit-message-convention-at-a-glance).

See [![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)

These commit messages will be used to auto-generate `CHANGELOG.md`.

Have a look at the [buck-trap README](https://github.com/nens/buck-trap/blob/master/README.md) for more information about the release procedure.


Production bundle
=================

Run `yarn build` and look in the `dist/` folder.
Now verify that the files in the `dist/` folder were updated.


Releasing
=========

To tag this as a new release and to add the `dist` folder to the release
attachments on github.com we use nens/buck-trap. If you have not already done so, create a github token and add it to `deploy/auth.json`.

You can create your tokens here: https://github.com/settings/tokens Grant the token full access under the repo section

The `auth.json` file should like similar to this:

```json
{
    "token": "Your-token-that-you-created-on-github"
}
```

Release:

```sh
npm run release
```

Buck-trap ups version number in `package.json`, compiles the `CHANGELOG.md` tags and creates a github release with a zipped `dist/`.
Verify in github that a new `release` was created with the correct version number.

_NOTE: Sometimes buck trap messes up for unknown reasons. It does everything except  making the github release. It hangs with the message: `tag already exists`. This sucks because you will have to [clean up the tag](https://nathanhoad.net/how-to-delete-a-remote-git-tag) and revert the release commit._

_NOTE on the NOTE: One time reverting the release commit an making a new release  it did not update the CHANGELOG.md again which resulted in this PR: [#821](https://github.com/nens/lizard-client/pull/821)._

_NOTE: When the `npm run release` script asks for authentication to github even though the token above was configured correctly, then this is probably because you are referencing the repository over https in package.json. The repository url should be the ssh variant which can be found on github under `clone repo`.

### Releasing hotfixes or patches
Consider fixing bugs before creating new features or release bugfixes together with features. This significantly simplifies development. If you do decide on fixing a bug after merging features and you cannot wait for another official release, create a bugfix branch as described by the [nens workflow](https://github.com/nens/inframan/blob/master/workflow/workflow.rst#bug-fixes).

Do not linger your bugfixes around. It was a bug right? Otherwise you might as well just put it in the normal feature flow. So create a [distribution](#build), release and deploy it. The fixes can be rolled out as patches without affecting the main release track. To run buck-trap from this branch and to release the branch with its `CHANGELOG.md`:

```sh
npm run release -- -b fixes_<bugged version you want to fix>
```

The `CHANGELOG.md` would have to be merged with master after the release, which might give some merge conflicts. C'est la vie.


Deployment
==========

For the deployment of frontend repositories we make use of an Ansible script in the lizard-nxt repository.
More information is provided in the readme file of lizard-nxt: https://github.com/nens/lizard-nxt/blob/master/README.rst
Look below the heading "Deployment clients".


Internationalisation
====================

This client has l10n/i18n support via react-intl.
English is the default/fallback language.

To extract translation tags to the i18n catalog: `$ yarn run i18n:extract`.
To update the language catalogs: `$ yarn run i18n:update`

To execute both subsequently, run: `$ yarn run i18n:extract-then-update`.

See `src/translations/locales/[language].json`. (where language is 'nl', for now)


Redux
=====

Uses lizard-api-client for XHR calls to the back-end and returns Immutable.js datastructures.
See actions.js and reducers.js.


React-router
============

There are two routes:

- "/" - renders the grid layout
- "/full/:id" - renders the detail page of a tile


Sentry
======

To be written...


Browser development extensions
==============================

These extensions may help:

- React Devtools for [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

- Redux Devtools for [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) or [Firefox](https://addons.mozilla.org/en-Gb/firefox/addon/remotedev/)
