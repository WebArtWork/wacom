import { test } from 'node:test';
import * as assert from 'node:assert';
import { MetaService } from './meta.service';
import { Config } from '../interfaces/config.interface';

function createService(routes: any[]): void {
  const router: any = { config: routes };
  const meta: any = { updateTag() {}, removeTag() {} };
  const title: any = { setTitle() {} };
  const config: Config = { meta: { warnMissingGuard: true, defaults: {} } };
  new MetaService(router, meta, title, config);
}

test('warns when top-level route lacks MetaGuard', () => {
  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => { warnings.push(args.join(' ')); };

  createService([{ path: 'top', data: { meta: { description: 'd' } } }]);

  console.warn = originalWarn;
  assert.ok(warnings.some(w => w.includes('Route with path "top"')), 'should warn for top-level route');
  assert.ok(warnings.some(w => w.includes('To disable these warnings')), 'should show disable message');
});

test('warns when nested child route lacks MetaGuard', () => {
  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => { warnings.push(args.join(' ')); };

  createService([{ path: 'parent', children: [{ path: 'child', data: { meta: { description: 'd' } } }] }]);

  console.warn = originalWarn;
  assert.ok(warnings.some(w => w.includes('Route with path "child"')), 'should warn for child route');
  assert.ok(warnings.some(w => w.includes('To disable these warnings')), 'should show disable message');
});

test('setDefaults merges new defaults with existing ones', () => {
  const router: any = { config: [] };
  const meta: any = { updateTag() {}, removeTag() {} };
  const title: any = { setTitle() {} };
  const config: Config = {
    meta: { warnMissingGuard: false, defaults: { title: 'Old', description: 'Old' } },
  };
  const service = new MetaService(router, meta, title, config);

  service.setDefaults({ description: 'New', extra: 'value' });

  assert.deepStrictEqual((service as any)._meta.defaults, {
    title: 'Old',
    description: 'New',
    extra: 'value',
  });
});
