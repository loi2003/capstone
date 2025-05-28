import React from 'react';

const SignIn = () => {
 return (
    <div style={{ padding: '1rem' }}>
      <h2>Đăng Nha65p</h2>
      <form>
        <input type='text' placeholder='Tên người dùng' /><br /><br />
        <input type='email' placeholder='Email' /><br /><br />
        <input type='password' placeholder='Mật khẩu' /><br /><br />
        <button type='submit'>Đăng ký</button>
      </form>
    </div>
  );
};

export default SignIn;