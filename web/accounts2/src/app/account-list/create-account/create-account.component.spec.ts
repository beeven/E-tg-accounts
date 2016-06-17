/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';

import { CreateAccountComponent } from './create-account.component';

describe('Component: CreateAccount', () => {
  it('should create an instance', () => {
    let component = new CreateAccountComponent();
    expect(component).toBeTruthy();
  });
});
