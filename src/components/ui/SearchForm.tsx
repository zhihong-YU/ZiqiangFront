import { Form } from 'antd';
import { AppForm, AppFormProps } from './AppForm';
import { Button } from './Button';

interface SearchFormProps<T> extends AppFormProps<T> {
  onReset?: () => void;
}

export const SearchForm = <T extends object = any>({
  children,
  onReset,
  ...props
}: SearchFormProps<T>) => {
  const [localForm] = Form.useForm<T>();
  const form = props.form || localForm;

  const handleReset = () => {
    form.resetFields();
    if (onReset) {
      onReset();
    }
    form.submit(); // Automatically submit after reset
  };

  return (
    <AppForm<T>
      layout="inline"
      form={form}
      {...props}
      style={{ marginBottom: 16, ...props.style }}
    >
      {children}
      <AppForm.Item>
        <Button type="primary" htmlType="submit">
          查询
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={handleReset}>
          重置
        </Button>
      </AppForm.Item>
    </AppForm>
  );
};
