import {
  SyntheticEvent,
  MouseEvent as ReactMouseEvent,
  useState,
  useRef,
  useCallback
} from 'react';

import useLatest from './useLatest';
import delay from './delay';
import createPortal, { Portal as PortalType } from './createPortal';

interface RCPF<T extends SyntheticEvent | Event = ReactMouseEvent> {
  (event?: T): void;
}
type OnHide = RCPF<ReactMouseEvent | MouseEvent | KeyboardEvent>;
interface Args {
  containerId?: string;
  defaultShow?: boolean;
  clickOutsideToHide?: boolean;
  escToHide?: boolean;
  internalShowHide?: boolean;
  onShow?: RCPF;
  onHide?: OnHide;
}
interface Return {
  readonly Portal: PortalType;
  readonly isShow: boolean;
  readonly show: RCPF;
  readonly hide: RCPF;
  readonly toggle: RCPF;
}

export const defaultContainerId = 'react-cool-portal';
export const initShow = true;
const usePortal = ({
  containerId = defaultContainerId,
  defaultShow = initShow,
  clickOutsideToHide = true,
  escToHide = true,
  internalShowHide = true,
  onShow,
  onHide
}: Args = {}): Return => {
  const [isShow, setIsShow] = useState<boolean>(defaultShow);
  const skipClickOutsideRef = useRef<boolean>(false);
  const onShowRef = useLatest<RCPF>(onShow);
  const onHideRef = useLatest<OnHide>(onHide);
  // Workaround: because handleHide() will cache "isShow" state
  const isShowRef = useRef<boolean>(defaultShow);

  const setSkipClickOutside = useCallback((): void => {
    if (!clickOutsideToHide) return;

    skipClickOutsideRef.current = true;
    delay(() => {
      skipClickOutsideRef.current = false;
    });
  }, [clickOutsideToHide]);

  const show = useCallback(
    e => {
      setSkipClickOutside();

      if (isShowRef.current) return;

      setIsShow(true);
      isShowRef.current = true;
      if (onShowRef.current) onShowRef.current(e);
    },
    [setSkipClickOutside, onShowRef]
  );

  const hide = useCallback(
    e => {
      setSkipClickOutside();

      if (!isShowRef.current) return;

      setIsShow(false);
      isShowRef.current = false;
      if (onHideRef.current) onHideRef.current(e);
    },
    [setSkipClickOutside, onHideRef]
  );

  const toggle = useCallback(
    e => {
      if (isShowRef.current) {
        hide(e);
      } else {
        show(e);
      }
    },
    [hide, show]
  );

  const handleHide = useCallback(
    e => {
      if (!skipClickOutsideRef.current) hide(e);
    },
    [hide]
  );

  const Portal = useCallback(
    createPortal(
      containerId,
      !internalShowHide || isShow,
      clickOutsideToHide && handleHide,
      escToHide && handleHide
    ),
    [internalShowHide && isShow]
  );

  return { Portal, isShow, show, hide, toggle };
};

export default usePortal;
