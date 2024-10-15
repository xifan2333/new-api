import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  Form,
  Row,
  Col,
  Typography,
  Modal,
  Banner,
  TagInput,
  Spin,
} from '@douyinfe/semi-ui';
const { Text } = Typography;
import {
  removeTrailingSlash,
  showError,
  showSuccess,
  verifyJSON,
} from '../helpers/utils';
import { API } from '../helpers/api';

const SystemSetting = () => {
  const [inputs, setInputs] = useState({});
  const [originInputs, setOriginInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const formApiRef = useRef(null);
  const [emailDomainWhitelist, setEmailDomainWhitelist] = useState([]);
  const [showPasswordLoginConfirmModal, setShowPasswordLoginConfirmModal] = useState(false);
  const [linuxDoOAuthEnabled, setLinuxDoOAuthEnabled] = useState(false);

  const getOptions = async () => {
    setLoading(true);
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = {};
      data.forEach((item) => {
        switch (item.key) {
          case 'TopupGroupRatio':
            item.value = JSON.stringify(JSON.parse(item.value), null, 2);
            break;
          case 'EmailDomainWhitelist':
            setEmailDomainWhitelist(item.value ? item.value.split(',') : []);
            break;
          case 'PasswordLoginEnabled':
          case 'PasswordRegisterEnabled':
          case 'EmailVerificationEnabled':
          case 'GitHubOAuthEnabled':
          case 'WeChatAuthEnabled':
          case 'TelegramOAuthEnabled':
          case 'RegisterEnabled':
          case 'TurnstileCheckEnabled':
          case 'EmailDomainRestrictionEnabled':
          case 'EmailAliasRestrictionEnabled':
          case 'SMTPSSLEnabled':
          case 'LinuxDoOAuthEnabled':
            item.value = item.value === 'true';
            break;
          case 'Price':
          case 'MinTopUp':
            item.value = parseFloat(item.value);
            break;
          default:
            break;
        }
        newInputs[item.key] = item.value;
      });
      setInputs(newInputs);
      setOriginInputs(newInputs);
      if (formApiRef.current) {
        formApiRef.current.setValues(newInputs);
      }
      setIsLoaded(true);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getOptions();
  }, []);

  const updateOption = async (key, value) => {
    setLoading(true);
    const res = await API.put('/api/option/', {
      key,
      value: typeof value === 'boolean' ? value.toString() : value,
    });
    const { success, message } = res.data;
    if (success) {
      showSuccess('更新成功');
      setInputs((prevInputs) => ({ ...prevInputs, [key]: value }));
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const handleFormChange = (values) => {
    setInputs(values);
  };

  const submitServerAddress = async () => {
    let ServerAddress = removeTrailingSlash(inputs.ServerAddress);
    await updateOption('ServerAddress', ServerAddress);
  };

  const submitWorker = async () => {
    let WorkerUrl = removeTrailingSlash(inputs.WorkerUrl);
    await updateOption('WorkerUrl', WorkerUrl);

    await updateOption('WorkerValidKey', inputs.WorkerValidKey);
  };

  const submitPayAddress = async () => {
    if (inputs.ServerAddress === '') {
      showError('请先填写服务器地址');
      return;
    }
    if (originInputs['TopupGroupRatio'] !== inputs.TopupGroupRatio) {
      if (!verifyJSON(inputs.TopupGroupRatio)) {
        showError('充值分组倍率不是合法的 JSON 字符串');
        return;
      }
      await updateOption('TopupGroupRatio', inputs.TopupGroupRatio);
    }
    let PayAddress = removeTrailingSlash(inputs.PayAddress);
    await updateOption('PayAddress', PayAddress);
    if (inputs.EpayId !== '') {
      await updateOption('EpayId', inputs.EpayId);
    }
    if (inputs.EpayKey !== undefined && inputs.EpayKey !== '') {
      await updateOption('EpayKey', inputs.EpayKey);
    }
    if (inputs.Price !== '') {
      await updateOption('Price', '' + inputs.Price);
    }
    if (inputs.MinTopUp !== '') {
      await updateOption('MinTopUp', '' + inputs.MinTopUp);
    }
    if (inputs.CustomCallbackAddress !== '') {
      await updateOption('CustomCallbackAddress', inputs.CustomCallbackAddress);
    }
  };

  const submitSMTP = async () => {
    if (originInputs['SMTPServer'] !== inputs.SMTPServer) {
      await updateOption('SMTPServer', inputs.SMTPServer);
    }
    if (originInputs['SMTPAccount'] !== inputs.SMTPAccount) {
      await updateOption('SMTPAccount', inputs.SMTPAccount);
    }
    if (originInputs['SMTPFrom'] !== inputs.SMTPFrom) {
      await updateOption('SMTPFrom', inputs.SMTPFrom);
    }
    if (
      originInputs['SMTPPort'] !== inputs.SMTPPort &&
      inputs.SMTPPort !== ''
    ) {
      await updateOption('SMTPPort', inputs.SMTPPort);
    }
    if (
      originInputs['SMTPToken'] !== inputs.SMTPToken &&
      inputs.SMTPToken !== ''
    ) {
      await updateOption('SMTPToken', inputs.SMTPToken);
    }
  };

  const submitEmailDomainWhitelist = async () => {
    if (Array.isArray(emailDomainWhitelist)) {
      await updateOption(
        'EmailDomainWhitelist',
        emailDomainWhitelist.join(','),
      );
    } else {
      showError('邮箱域名白名单格式不正确');
    }
  };

  const submitWeChat = async () => {
    if (originInputs['WeChatServerAddress'] !== inputs.WeChatServerAddress) {
      await updateOption(
        'WeChatServerAddress',
        removeTrailingSlash(inputs.WeChatServerAddress),
      );
    }
    if (
      originInputs['WeChatAccountQRCodeImageURL'] !==
      inputs.WeChatAccountQRCodeImageURL
    ) {
      await updateOption(
        'WeChatAccountQRCodeImageURL',
        inputs.WeChatAccountQRCodeImageURL,
      );
    }
    if (
      originInputs['WeChatServerToken'] !== inputs.WeChatServerToken &&
      inputs.WeChatServerToken !== ''
    ) {
      await updateOption('WeChatServerToken', inputs.WeChatServerToken);
    }
  };

  const submitGitHubOAuth = async () => {
    if (originInputs['GitHubClientId'] !== inputs.GitHubClientId) {
      await updateOption('GitHubClientId', inputs.GitHubClientId);
    }
    if (
      originInputs['GitHubClientSecret'] !== inputs.GitHubClientSecret &&
      inputs.GitHubClientSecret !== ''
    ) {
      await updateOption('GitHubClientSecret', inputs.GitHubClientSecret);
    }
  };

  const submitTelegramSettings = async () => {
    await updateOption('TelegramBotToken', inputs.TelegramBotToken);
    await updateOption('TelegramBotName', inputs.TelegramBotName);
  };

  const submitTurnstile = async () => {
    if (originInputs['TurnstileSiteKey'] !== inputs.TurnstileSiteKey) {
      await updateOption('TurnstileSiteKey', inputs.TurnstileSiteKey);
    }
    if (
      originInputs['TurnstileSecretKey'] !== inputs.TurnstileSecretKey &&
      inputs.TurnstileSecretKey !== ''
    ) {
      await updateOption('TurnstileSecretKey', inputs.TurnstileSecretKey);
    }
  };

  const submitLinuxDoOAuth = async () => {
    if (originInputs['LinuxDoClientId'] !== inputs.LinuxDoClientId) {
      await updateOption('LinuxDoClientId', inputs.LinuxDoClientId);
    }
    if (
      originInputs['LinuxDoClientSecret'] !== inputs.LinuxDoClientSecret &&
      inputs.LinuxDoClientSecret !== ''
    ) {
      await updateOption('LinuxDoClientSecret', inputs.LinuxDoClientSecret);
    }
    if (originInputs['LinuxDoMinLevel'] !== inputs.LinuxDoMinLevel) {
      await updateOption('LinuxDoMinLevel', inputs.LinuxDoMinLevel);
    }
  };

  const handleCheckboxChange = async (optionKey, event) => {
    const value = event.target.checked;
    if (optionKey === 'PasswordLoginEnabled' && !value) {
      setShowPasswordLoginConfirmModal(true);
    } else {
      await updateOption(optionKey, value);
    }
    if (optionKey === 'LinuxDoOAuthEnabled') {
      setLinuxDoOAuthEnabled(value);
    }
  };



  const handlePasswordLoginConfirm = async () => {
    await updateOption('PasswordLoginEnabled', false);
    setShowPasswordLoginConfirmModal(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      {isLoaded ? (
        <Form
          initValues={inputs}
          onValueChange={handleFormChange}
          getFormApi={(api) => (formApiRef.current = api)}
        >
          {({ formState, values, formApi }) => (
            <>
              <Form.Section text='通用设置'>
                <Form.Input
                  field='ServerAddress'
                  label='服务器地址'
                  placeholder='例如：https://yourdomain.com'
                  style={{ width: '100%' }}
                />
                <Button onClick={submitServerAddress}>更新服务器地址</Button>
              </Form.Section>

              <Form.Section text='代理设置'>
                <Text>
                  （支持{' '}
                  <a
                    href='https://github.com/Calcium-Ion/new-api-worker'
                    target='_blank'
                    rel='noreferrer'
                  >
                    new-api-worker
                  </a>
                  ）
                </Text>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Input
                      field='WorkerUrl'
                      label='Worker地址'
                      placeholder='例如：https://workername.yourdomain.workers.dev'
                    />
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Input
                      field='WorkerValidKey'
                      label='Worker密钥'
                      placeholder='例如：your_secret_key'
                    />
                  </Col>
                </Row>
                <Button onClick={submitWorker}>更新Worker设置</Button>
              </Form.Section>

              <Form.Section text='支付设置'>
                <Text>
                  （当前仅支持易支付接口，默认使用上方服务器地址作为回调地址！）
                </Text>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input
                      field='PayAddress'
                      label='支付地址'
                      placeholder='例如：https://yourdomain.com'
                    />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input
                      field='EpayId'
                      label='易支付商户ID'
                      placeholder='例如：0001'
                    />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input
                      field='EpayKey'
                      label='易支付商户密钥'
                      placeholder='敏感信息不会发送到前端显示'
                      type='password'
                    />
                  </Col>
                </Row>
                <Row
                  gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}
                  style={{ marginTop: 16 }}
                >
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input
                      field='CustomCallbackAddress'
                      label='回调地址'
                      placeholder='例如：https://yourdomain.com'
                    />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.InputNumber
                      field='Price'
                      precision={2}
                      label='充值价格（x元/美金）'
                      placeholder='例如：7，就是7元/美金'
                    />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.InputNumber
                      field='MinTopUp'
                      label='最低充值美元数量'
                      placeholder='例如：2，就是最低充值2$'
                    />
                  </Col>
                </Row>
                <Form.TextArea
                  field='TopupGroupRatio'
                  label='充值分组倍率'
                  placeholder='为一个 JSON 文本，键为组名称，值为倍率'
                  autosize
                />
                <Button onClick={submitPayAddress}>更新支付设置</Button>
              </Form.Section>

              <Form.Section text='配置登录注册'>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Checkbox
                      field='PasswordLoginEnabled'
                      noLabel
                      onChange={(e) =>
                        handleCheckboxChange('PasswordLoginEnabled', e)
                      }
                    >
                      允许通过密码进行登录
                    </Form.Checkbox>
                    <Form.Checkbox
                      field='PasswordRegisterEnabled'
                      noLabel
                      onChange={(e) =>
                        handleCheckboxChange('PasswordRegisterEnabled', e)
                      }
                    >
                      允许通过密码进行注册
                    </Form.Checkbox>
                    <Form.Checkbox
                      field='EmailVerificationEnabled'
                      noLabel
                      onChange={(e) =>
                        handleCheckboxChange('EmailVerificationEnabled', e)
                      }
                    >
                      通过密码注册时需要进行邮箱验证
                    </Form.Checkbox>
                    <Form.Checkbox
                      field='GitHubOAuthEnabled'
                      noLabel
                      onChange={(e) =>
                        handleCheckboxChange('GitHubOAuthEnabled', e)
                      }
                    >
                      允许通过 GitHub 账户登录 & 注册
                    </Form.Checkbox>
                    <Form.Checkbox
                      field='LinuxDoOAuthEnabled'
                      noLabel
                      onChange={(e) =>
                        handleCheckboxChange('LinuxDoOAuthEnabled', e)
                      }
                    >
                      允许通过 Linux DO 账户登录 & 注册
                    </Form.Checkbox>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Checkbox
                      field='WeChatAuthEnabled'
                      noLabel
                      onChange={(e) =>
                        handleCheckboxChange('WeChatAuthEnabled', e)
                      }
                    >
                      允许通过微信登录 & 注册
                    </Form.Checkbox>
                    <Form.Checkbox
                      field='TelegramOAuthEnabled'
                      noLabel
                      onChange={(e) =>
                        handleCheckboxChange('TelegramOAuthEnabled', e)
                      }
                    >
                      允许通过 Telegram 进行登录
                    </Form.Checkbox>
                    <Form.Checkbox
                      field='RegisterEnabled'
                      noLabel
                      onChange={(e) => handleCheckboxChange('RegisterEnabled', e)}
                    >
                      允许新用户注册
                    </Form.Checkbox>
                    <Form.Checkbox
                      field='TurnstileCheckEnabled'
                      noLabel
                      onChange={(e) =>
                        handleCheckboxChange('TurnstileCheckEnabled', e)
                      }
                    >
                      启用 Turnstile 用户校验
                    </Form.Checkbox>
                  </Col>
                </Row>
              </Form.Section>

              <Form.Section text='配置邮箱域名白名单'>
                <Text>用以防止恶意用户利用临时邮箱批量注册</Text>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Checkbox
                      field='EmailDomainRestrictionEnabled'
                      noLabel
                      onChange={(e) =>
                        handleCheckboxChange('EmailDomainRestrictionEnabled', e)
                      }
                    >
                      启用邮箱域名白名单
                    </Form.Checkbox>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Checkbox
                      field='EmailAliasRestrictionEnabled'
                      noLabel
                      onChange={(e) =>
                        handleCheckboxChange('EmailAliasRestrictionEnabled', e)
                      }
                    >
                      启用邮箱别名限制
                    </Form.Checkbox>
                  </Col>
                </Row>
                <TagInput
                  value={emailDomainWhitelist}
                  onChange={setEmailDomainWhitelist}
                  placeholder='输入域名后回车'
                  style={{ width: '100%', marginTop: 16 }}
                />
                <Button
                  onClick={submitEmailDomainWhitelist}
                  style={{ marginTop: 10 }}
                >
                  保存邮箱域名白名单设置
                </Button>
              </Form.Section>

              <Form.Section text='配置 SMTP'>
                <Text>用以支持系统的邮件发送</Text>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input field='SMTPServer' label='SMTP 服务器地址' />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input field='SMTPPort' label='SMTP 端口' />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input field='SMTPAccount' label='SMTP 账户' />
                  </Col>
                </Row>
                <Row
                  gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}
                  style={{ marginTop: 16 }}
                >
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input field='SMTPFrom' label='SMTP 发送者邮箱' />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input
                      field='SMTPToken'
                      label='SMTP 访问凭证'
                      type='password'
                    />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Checkbox
                      field='SMTPSSLEnabled'
                      noLabel
                      onChange={(e) => handleCheckboxChange('SMTPSSLEnabled', e)}
                    >
                      启用SMTP SSL
                    </Form.Checkbox>
                  </Col>
                </Row>
                <Button onClick={submitSMTP}>保存 SMTP 设置</Button>
              </Form.Section>

              <Form.Section text='配置 GitHub OAuth App'>
                <Text>用以支持通过 GitHub 进行登录注册</Text>
                <Banner
                  type='info'
                  description={`Homepage URL 填 ${inputs.ServerAddress ? inputs.ServerAddress : '网站地址'}，Authorization callback URL 填 ${inputs.ServerAddress ? inputs.ServerAddress : '网站地址'}/oauth/github`}
                  style={{ marginBottom: 20, marginTop: 16 }}
                />
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Input field='GitHubClientId' label='GitHub Client ID' />
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Input
                      field='GitHubClientSecret'
                      label='GitHub Client Secret'
                      type='password'
                    />
                  </Col>
                </Row>
                <Button onClick={submitGitHubOAuth}>
                  保存 GitHub OAuth 设置
                </Button>
              </Form.Section>
              <Form.Section text='配置 Linux DO OAuth'>
                <Text>用以支持通过 Linux DO 进行登录注册</Text>
                <Banner
                  type='info'
                  description={`回调 URL 填 ${inputs.ServerAddress ? inputs.ServerAddress : '网站地址'}/oauth/linuxdo`}
                  style={{ marginBottom: 20, marginTop: 16 }}
                />
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input field='LinuxDoClientId' label='Linux DO Client ID' />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input
                      field='LinuxDoClientSecret'
                      label='Linux DO Client Secret'
                      type='password'
                    />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.InputNumber
                      field='LinuxDoMinLevel'
                      label='Linux DO 最低信任等级'
                      min={0}
                    />
                  </Col>
                </Row>
                <Button onClick={submitLinuxDoOAuth}>
                  保存 Linux DO OAuth 设置
                </Button>
              </Form.Section>
              <Form.Section text='配置 WeChat Server'>
                <Text>用以支持通过微信进行登录注册</Text>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input
                      field='WeChatServerAddress'
                      label='WeChat Server 服务器地址'
                    />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input
                      field='WeChatServerToken'
                      label='WeChat Server 访问凭证'
                      type='password'
                    />
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Input
                      field='WeChatAccountQRCodeImageURL'
                      label='微信公众号二维码图片链接'
                    />
                  </Col>
                </Row>
                <Button onClick={submitWeChat}>保存 WeChat Server 设置</Button>
              </Form.Section>
              <Form.Section text='配置 Telegram 登录'>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Input
                      field='TelegramBotToken'
                      label='Telegram Bot Token'
                    />
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Input
                      field='TelegramBotName'
                      label='Telegram Bot 名称'
                    />
                  </Col>
                </Row>
                <Button onClick={submitTelegramSettings}>
                  保存 Telegram 登录设置
                </Button>
              </Form.Section>
              <Form.Section text='配置 Turnstile'>
                <Text>用以支持用户校验</Text>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Input
                      field='TurnstileSiteKey'
                      label='Turnstile Site Key'
                    />
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Input
                      field='TurnstileSecretKey'
                      label='Turnstile Secret Key'
                      type='password'
                    />
                  </Col>
                </Row>
                <Button onClick={submitTurnstile}>保存 Turnstile 设置</Button>
              </Form.Section>
            
              <Modal
                title="确认取消密码登录"
                visible={showPasswordLoginConfirmModal}
                onOk={handlePasswordLoginConfirm}
                onCancel={() => {
                  setShowPasswordLoginConfirmModal(false);
                  formApiRef.current.setValue('PasswordLoginEnabled', true);
                }}
                okText="确认"
                cancelText="取消"
              >
                <p>您确定要取消密码登录功能吗？这可能会影响用户的登录方式。</p>
              </Modal>
            </>
          )}
        </Form>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default SystemSetting;