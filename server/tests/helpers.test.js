const { databases } = require('../util/config');
const { db } = require('../util/config');
const { cleanInputs, isUserAuthorized } = require('../util/helpers');

describe('test the plumbing of the url and slug interactions', () => {
  let mockSlug = 'goog';
  let mockUrl = 'https://www.google.com/test';
  let mockIncorrectSlug = 'g';
  let mockUser = { id: 1, displayName: 'George Washington', email: 'thebestpresident@fake.com' };
  let authorizedGoogleProfile = {
    id: 1,
    displayName: 'George Washington',
    emails: [{ value: 'thebestpresident@fake.com' }],
  };
  let notAuthorizedGoogleProfile = {
    id: 2,
    displayName: 'Plato',
    emails: [{ value: 'whatreallyisemail@fake.com' }],
  };

  beforeAll(async () => {
    await db.connect(databases.test.database);
    await db.clearCollection('urls');
    await db.clearCollection('errors');
    await db.clearCollection('failedRequests');
    await db.clearCollection('users');
    await db.createNewSlug(mockSlug, mockUrl);
    await db.addUser(mockUser);
  });

  afterAll(async () => {
    await db.clearCollection('urls');
    await db.clearCollection('errors');
    await db.clearCollection('failedRequests');
    await db.clearCollection('users');
    await db.disconnect();
  });

  it('checks authorization helper function that gives callback - user is authorized', async () => {
    let complete = (err, user) => {
      if (user) return true;
      return false;
    };
    let isAuthorized = await isUserAuthorized(null, null, null, authorizedGoogleProfile, complete);
    expect(isAuthorized).toBe(true);
  });

  it('checks authorization helper function that gives callback - user is not authorized', async () => {
    let complete = (err, isAuthorized) => {
      if (isAuthorized) return true;
      return false;
    };
    let isAuthorized = await isUserAuthorized(null, null, null, notAuthorizedGoogleProfile, complete);
    expect(isAuthorized).toBe(false);
  });

  it('add a slug <=> url relationship', async () => {
    let { slug, url } = await cleanInputs(mockSlug, mockUrl);
    let { insertedCount } = await db.createNewSlug(slug, url);
    expect(insertedCount).toEqual(1);
  });

  it('will correct an incorrect slug for validation', async () => {
    let { slug, url } = await cleanInputs(mockIncorrectSlug, mockUrl);
    let { insertedCount } = await db.createNewSlug(slug, url);
    expect(insertedCount).toEqual(1);
  });

  it('will generate a new slug if exists already', async () => {
    let { slug, forcedToRegenerate } = await cleanInputs(mockSlug, mockUrl);
    expect(slug).not.toEqual(mockSlug);
    expect(forcedToRegenerate).toBeTruthy();
  });

  it('will retrieve a url from a slug', async () => {
    await db.createNewSlug(mockSlug, mockUrl);
    let { url } = await db.getUrlFromSlug(mockSlug);
    expect(url).toEqual(mockUrl);
  });

  it('returns an array of slugs from a url, including the expected one ', async () => {
    await db.createNewSlug(mockSlug, mockUrl);
    let slugs = await db.getSlugsFromUrl(mockUrl);
    let doesExist = slugs.some(({ slug }) => slug === mockSlug);
    expect(Array.isArray(slugs)).toBeTruthy();
    expect(doesExist).toBeTruthy();
  });

  it('returns a web address stripped of http and www', async () => {
    let { url } = await cleanInputs(mockSlug, mockUrl);
    expect(url).toEqual('google.com/test');
  });

  it('will generate a random slug id if one is not provided', async () => {
    let { slug } = await cleanInputs(null, mockUrl);
    expect(slug).toBeTruthy();
  });
  it('will force lowercase for the slug', async () => {
    let { slug } = await cleanInputs('ASDF', mockUrl);
    expect(slug).toEqual(slug.toLowerCase());
  });

  it('will test a correct url and slug combination and return valid', async () => {
    let { slug, url, forcedToRegenerate, error } = await cleanInputs('slug', 'https://google.com');
    expect(slug).toBeTruthy();
    expect(url).toBeTruthy();
    expect(error).toBeFalsy();
  });

  it('will return an error for invalid url', async () => {
    let { result, error } = await cleanInputs('slug', 'this-is-an-invalid-url');
    expect(error).toEqual('URL is not valid');
    expect(result).toBeFalsy();
  });
});
