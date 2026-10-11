import { Modal, ModalProps } from 'antd';
import { AppForm, AppFormProps } from './AppForm';

interface FormModalProps<T> extends ModalProps {
  formProps?: AppFormProps<T>;
  children?: React.ReactNode;
}

export const FormModal = <T extends object = Record<string, unknown>>({
  formProps,
  children,
  onOk, // We intercept onOk
  ...modalProps
}: FormModalProps<T>) => {
  const [localForm] = AppForm.useForm<T>();
  const form = formProps?.form || localForm;

  const handleOk = (e: React.MouseEvent<HTMLButtonElement>) => {
    form.submit();
    // We don't call onOk directly here because we want the form submission to handle the logic.
    // But if onOk is provided as a prop to handle "after submit" or override, it's tricky.
    // Usually FormModal logic is: Click OK -> Form Submit -> Validate -> API Call -> Close Modal.
    // The API Call is in formProps.onFinishAsync.
    // So onOk here is just the trigger.
    if (onOk) {
        onOk(e);
    }
  };

  return (
    <Modal
      onOk={handleOk}
      destroyOnHidden
      {...modalProps}
    >
      <AppForm<T>
        form={form}
        {...formProps}
      >
        {children}
      </AppForm>
    </Modal>
  );
};
