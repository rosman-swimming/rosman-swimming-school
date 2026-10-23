# Remaining steps before launch

- Add original `flyer.jpg` and `og.jpg` (binary assets) from the last approved site package to repository root.
- Test the build by running `node build.js` and visually compare with currently published site.
- Merge reviewed branch after asset verification.
- In the hosted Pages CMS, sign in with GitHub and install Pages CMS for this repository.
- Connect the existing Netlify project to repository branch `main`, build command `node build.js`, publish directory `dist`.
- Perform one test edit (e.g., price), verify deploy, then revert.
- Confirm that the current site remains available until cutover.

Pages CMS editor is hosted at https://app.pagescms.org/ and does not require Decap CMS OAuth configuration. The `/admin/` directory on this branch is an unused Decap experiment and should not be used for production.
