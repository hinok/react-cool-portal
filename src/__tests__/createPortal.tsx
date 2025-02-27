import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import createPortal from '../createPortal';
import { defaultContainerId } from '..';

describe('createPortal', () => {
  const childId = 'test';

  interface Args {
    containerId?: string;
    isShow?: boolean;
  }
  interface Return {
    clickOutsideCb: Function;
    escCb: Function;
    baseElement: any;
    getByTestId: Function;
    unmount: Function;
  }

  const renderHelper = ({
    containerId = defaultContainerId,
    isShow = true
  }: Args = {}): Return => {
    const clickOutsideCb = jest.fn();
    const escCb = jest.fn();
    const Portal = createPortal(containerId, isShow, clickOutsideCb, escCb);
    const { baseElement, getByTestId, unmount } = render(
      <Portal>
        <div data-testid={childId}>Test</div>
      </Portal>
    );

    return { clickOutsideCb, escCb, baseElement, getByTestId, unmount };
  };

  it('should render correctly', () => {
    const { baseElement } = renderHelper();
    expect(baseElement).toMatchSnapshot();
  });

  it('should not render child', () => {
    const { baseElement } = renderHelper({ isShow: false });
    expect(baseElement).toMatchSnapshot();
  });

  it('should auto remove root', () => {
    jest.useFakeTimers();

    const { baseElement, unmount } = renderHelper();
    unmount();
    jest.runAllTimers();
    expect(baseElement).toMatchSnapshot();
  });

  it('should trigger callback when clicks outside of the child', () => {
    const { clickOutsideCb } = renderHelper();
    fireEvent.click(document);
    expect(clickOutsideCb).toBeCalled();
  });

  it('should not trigger callback when clicks inside of the child', () => {
    const { getByTestId, clickOutsideCb } = renderHelper();
    fireEvent.click(getByTestId(childId));
    expect(clickOutsideCb).not.toBeCalled();
  });

  it('should trigger callback when presses ESC key', () => {
    const { escCb } = renderHelper();
    fireEvent.keyDown(document, { keyCode: 27 });
    expect(escCb).toBeCalled();
  });

  it('should not trigger callbacks when isShow set to false', () => {
    const { clickOutsideCb, escCb } = renderHelper({ isShow: false });
    fireEvent.click(document);
    fireEvent.keyDown(document, { keyCode: 27 });
    expect(clickOutsideCb).not.toBeCalled();
    expect(escCb).not.toBeCalled();
  });
});
