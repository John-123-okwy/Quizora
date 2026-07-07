import { useState } from 'react';
import styles from './PasswordInput.module.css';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export default function PasswordInput({ id, name, value, onChange, required, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.wrapper}>
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={name}
        placeholder={placeholder}
      />
      <button
        type="button"
        className={styles.toggleBtn}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon/> : <EyeIcon/>}
      </button>
    </div>
  );
}