import React, { useContext, useEffect, useState } from 'react';
import { Spin, Typography } from '@douyinfe/semi-ui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API, showError, showSuccess } from '../helpers';
import { UserContext } from '../context/User';

// 实现 LinuxDo OAuth 的前端逻辑
const LinuxDoOAuth = () => {
  const [searchParams] = useSearchParams();
  const [, userDispatch] = useContext(UserContext);
  const [prompt, setPrompt] = useState('处理中...');
  const [processing, setProcessing] = useState(true);

  let navigate = useNavigate();

  const sendCode = async (code, state, count) => {
    let aff = localStorage.getItem('aff');
    const res = await API.get(
      `/api/oauth/linuxdo?code=${code}&state=${state}&aff=${aff}`,
    );
    const { success, message, data } = res.data;
    if (success) {
      localStorage.removeItem('aff');

      if (message === 'bind') {
        showSuccess('绑定成功！');
        navigate('/setting');
      } else {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        showSuccess('登录成功！');
        navigate('/');
      }
    } else {
      showError(message);
      if (count === 0) {
        setPrompt(`操作失败，重定向至登录界面中...`);
        navigate('/setting'); // in case this is failed to bind GitHub
        return;
      }
      count++;
      setPrompt(`出现错误，第 ${count} 次重试中...`);
      await new Promise((resolve) => setTimeout(resolve, count * 2000));
      await sendCode(code, state, count);
    }
  };

  useEffect(() => {
    let error = searchParams.get('error');
    if (error) {
      let errorDescription = searchParams.get('error_description');
      showError(`授权错误：${error}: ${errorDescription}`);
      navigate('/setting');
      return;
    }

    let code = searchParams.get('code');
    let state = searchParams.get('state');
    sendCode(code, state, 0).then();
  }, []);

  return (
    <div style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Spin spinning={processing} size="large">
        <Typography.Text>{prompt}</Typography.Text>
      </Spin>
    </div>
  );
};

export default LinuxDoOAuth;
