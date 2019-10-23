/*
 * @文件描述: 发送验证码的逻辑封装
 * @公司: thundersdata
 * @作者: 陈杰
 * @Date: 2019-10-14 15:39:09
 * @LastEditors: 陈杰
 * @LastEditTime: 2019-10-16 13:37:03
 */
import { FETCH_OPTIONS, AUTH_PARAMS, toastSuccess, toastFail } from '../stores/common';
import regexUtils from '../utils/regex-utils';
import { useState, useRef } from 'react';
import request from '../utils/request';
import { useNetInfo } from '@react-native-community/netinfo';

export default function useSmsSend() {
  const netInfo = useNetInfo();
  const [smsText, setSmsText] = useState('获取验证码');
  const countRef = useRef(60);
  let interval: NodeJS.Timeout;

  const sendSms = async (mobile: string, type: number) => {
    if (!netInfo.isConnected) {
      toastFail('设备未联网，请检查');
      return;
    }
    if (!mobile) {
      toastFail('请输入手机号码');
    } else if (!regexUtils.isPhone(mobile)) {
      toastFail('手机号码格式不正确');
    } else {
      try {
        const result = await request.authForm(FETCH_OPTIONS.mine.sms.url, {
          mobile,
          type,
          clientId: AUTH_PARAMS.clientId,
          appVersion: AUTH_PARAMS.appVersion,
        });
        if (result.success) {
          toastSuccess('验证码发送成功');
          interval = setInterval(() => {
            countRef.current = countRef.current - 1;
            setSmsText(`${countRef.current}s`);
            if (countRef.current === 0) {
              clearInterval(interval);
              countRef.current = 60;
              setSmsText('获取验证码');
            }
          }, 1000);
        } else {
          toastFail('验证码发送失败');
        }
      } catch (error) {
        toastFail('验证码发送失败');
      }
    }
  };

  const clearSms = () => {
    clearInterval(interval);
  };

  return [smsText, sendSms, clearSms] as const;
}
