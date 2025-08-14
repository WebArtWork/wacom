import { MetaService } from './meta.service';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

describe('MetaService', () => {
  let service: MetaService;
  let meta: jasmine.SpyObj<Meta>;
  let title: jasmine.SpyObj<Title>;
  let router: Partial<Router>;

  beforeEach(() => {
    meta = jasmine.createSpyObj('Meta', ['updateTag', 'removeTag']);
    title = jasmine.createSpyObj('Title', ['setTitle']);
    router = { config: [] };
    service = new MetaService(router as Router, meta, title, undefined);
  });

  it('should update twitter:title when setting title', () => {
    service.setTitle('Test Title');
    expect(meta.updateTag).toHaveBeenCalledWith({ property: 'twitter:title', content: 'Test Title' });
  });
});
