import { Form, FormProps, message } from 'antd';
import { ReactNode } from 'react';

export interface AppFormProps<T> extends Omit<FormProps<T>, 'onFinish'> {
  onFinishAsync?: (values: T) => Promise<unknown>;
  successMessage?: string;
  children?: ReactNode;
}

export const AppForm = <T extends object = Record<string, unknown>>({
  onFinishAsync,
  successMessage = '',
  children,
  ...props
}: AppFormProps<T>) => {
  const handleFinish = async (values: T) => {
    try {
      if (onFinishAsync) {
        await onFinishAsync(values);
        if (successMessage) {
          message.success(successMessage);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Depending on requirement, we might show error message here too.
    }
  };

  return (
    <Form<T>
      layout="vertical"
      {...props}
      onFinish={handleFinish}
    >
      {children}
    </Form>
  );
};

AppForm.Item = Form.Item;
AppForm.useForm = Form.useForm;
AppForm.List = Form.List;
AppForm.Provider = Form.Provider;
AppForm.ErrorList = Form.ErrorList;
