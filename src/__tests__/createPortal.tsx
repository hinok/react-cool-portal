import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import createPortal from '../createPortal';

describe('createPortal', () => {
  const rootId = 'react-cool-portal';
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
    containerId = rootId,
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
});
