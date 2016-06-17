/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';

import { QueryListComponent } from './query-list.component';

describe('Component: QueryList', () => {
  it('should create an instance', () => {
    let component = new QueryListComponent();
    expect(component).toBeTruthy();
  });
});
