import assert from 'node:assert/strict';
import { test } from 'node:test';
import { flagBool, flagString, parseArgs } from '../dist/cli/args.js';

test('news consumes the documented candidate slug instead of dropping the filter', () => {
  for (const slug of ['example-maker', 'false', '1']) {
    const args = parseArgs(['news', '--candidate', slug]);
    assert.equal(args.command, 'news');
    assert.equal(flagString(args, 'candidate'), slug);
    assert.deepEqual(args.positional, []);
  }
});

test('news candidate filters work with preceding global flags and later filters', () => {
  const args = parseArgs(['--json', 'news', '--candidate', 'example-maker', '--following']);
  assert.equal(args.command, 'news');
  assert.equal(flagString(args, 'candidate'), 'example-maker');
  assert.equal(flagBool(args, 'json'), true);
  assert.equal(flagBool(args, 'following'), true);
  assert.deepEqual(args.positional, []);
});

test('news keeps equals syntax and repeated candidate filters', () => {
  const args = parseArgs(['news', '--candidate=first-maker', '--candidate', 'second-maker']);
  assert.equal(flagString(args, 'candidate'), 'second-maker');
  assert.deepEqual(args.positional, []);
});

test('candidate remains boolean for commands that use it as a subject switch', () => {
  for (const command of ['follow', 'unfollow', 'recommend', 'recommendations', 'message']) {
    const args = parseArgs([command, '--candidate', 'example-maker', 'sample text']);
    assert.equal(flagBool(args, 'candidate'), true);
    assert.deepEqual(args.positional, ['example-maker', 'sample text']);
    const disabled = parseArgs([command, '--candidate', 'false', 'example-maker']);
    assert.equal(flagBool(disabled, 'candidate'), false);
    assert.deepEqual(disabled.positional, ['example-maker']);
  }
});

test('news preserves the option terminator and does not consume another option as a slug', () => {
  const stopped = parseArgs(['news', '--', '--candidate', 'example-maker']);
  assert.equal(flagString(stopped, 'candidate'), undefined);
  assert.deepEqual(stopped.positional, ['--candidate', 'example-maker']);
  const missing = parseArgs(['news', '--candidate', '--following']);
  assert.equal(flagString(missing, 'candidate'), undefined);
  assert.equal(flagBool(missing, 'following'), true);
});
