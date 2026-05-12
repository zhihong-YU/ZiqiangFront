import { Modal as AntModal, ModalProps } from 'antd';
import { ReactNode } from 'react';

interface AppModalProps extends ModalProps {
  children?: ReactNode;
}

export const Modal = ({ children, ...props }: AppModalProps) => {
  return <AntModal {...props}>{children}</AntModal>;
};

// Re-export static methods
Modal.info = AntModal.info;
Modal.success = AntModal.success;
Modal.error = AntModal.error;
Modal.warning = AntModal.warning;
Modal.confirm = AntModal.confirm;
Modal.destroyAll = AntModal.destroyAll;
Modal.useModal = AntModal.useModal;
