const { databases } = require('../lib/config');
const { db } = require('../lib/config');
const { schemaValidation } = require('../lib/helpers');

describe('test the plumbing of the url and slug interactions', () => {
  let mockSlug = 'goog';
  let mockUrl = 'https://www.google.com/test';
  let mockIncorrectSlug = 'g';

  beforeAll(async () => {
    await db.connect(databases.test.database);
  });

  afterAll(async () => {
    await db.clearCollection('urls');
    await db.clearCollection('errors');
    await db.createNewSlug(mockSlug, mockUrl);
    await db.disconnect();
  });

  it('should connect to the database', async () => {
    let status = db.status();
    expect(status).toBeTruthy();
  });

  it('add a slug <=> url relationship', async () => {
    let { slug, url } = await schemaValidation(mockSlug, mockUrl);
    let { insertedCount } = await db.createNewSlug(slug, url);
    expect(insertedCount).toEqual(1);
  });

  it('will correct an incorrect slug for validation', async () => {
    let { slug, url } = await schemaValidation(mockIncorrectSlug, mockUrl);
    let { insertedCount } = await db.createNewSlug(slug, url);
    expect(insertedCount).toEqual(1);
  });

  it('will generate a new slug if exists already', async () => {
    let { slug, forcedToRegenerate } = await schemaValidation(mockSlug, mockUrl);
    expect(slug).not.toEqual(mockSlug);
    expect(forcedToRegenerate).toBeTruthy();
  });

  it('will retrieve a url from a slug', async () => {
    let create = await db.createNewSlug(mockSlug, mockUrl);
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
    let { url } = await schemaValidation(mockSlug, mockUrl);
    expect(url).toEqual('google.com/test');
  });

  it('will generate a random slug id if one is not provided', async () => {
    let { slug } = await schemaValidation(null, mockUrl);
    expect(slug).toBeTruthy();
  });
  it('will force lowercase for the slug', async () => {
    let { slug } = await schemaValidation('ASDF', mockUrl);
    expect(slug).toEqual(slug.toLowerCase());
  });
});
