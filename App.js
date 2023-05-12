import React, {useState} from 'react';
import {View, Text, TextInput, Button, Alert} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import jsSHA from 'jssha';

const App = () => {
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecret(secret);
  };

  const verifyCode = () => {
    console.log('generateOTP(secret)', generateOTP(secret));
    if (code === generateOTP(secret)) {
      Alert.alert('verified');
    } else {
      setError('Invalid code');
    }
  };

  const generateOTP = secret => {
    const epoch = Math.round(new Date().getTime() / 1000.0);
    const time = Math.floor(epoch / 30)
      .toString(16)
      .padStart(16, '0');
    const shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.setHMACKey(base32tohex(secret), 'HEX');
    shaObj.update(hex2str(time));
    const hmac = shaObj.getHMAC('HEX');
    const offset = parseInt(hmac.substring(hmac.length - 1), 16) * 2;
    const otp = (
      (parseInt(hmac.substring(offset, offset + 8), 16) & 0x7fffffff) %
      1000000
    )
      .toString()
      .padStart(6, '0');
    return otp;
  };

  const base32tohex = base32 => {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let hex = '';
    for (let i = 0; i < base32.length; i++) {
      const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
      bits += val.toString(2).padStart(5, '0');
    }
    for (let i = 0; i < bits.length - 3; i += 4) {
      const chunk = bits.substr(i, 4);
      hex = hex + parseInt(chunk, 2).toString(16);
    }
    return hex;
  };

  const hex2str = hex => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const char = String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      str += char;
    }
    return str;
  };

  return (
    <View style={{alignItems: 'center', padding: 20, flex: 1}}>
      <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 20}}>
        Gaurav's Task
      </Text>
      <View style={{alignItems: 'center'}}>
        {secret ? (
          <View style={{alignItems: 'center'}}>
            <QRCode
              value={`otpauth://totp/My%20App?secret=${secret}&issuer=My%20App`}
              size={200}
            />
            <Text style={{marginTop: 10}}>{secret}</Text>
          </View>
        ) : (
          <Button title="Generate Secret" onPress={generateSecret} />
        )}
        <Text style={{marginVertical: 20}}>
          Enter the code from the Google Authenticator app:
        </Text>
        <View style={{marginBottom: 20}}>
          <TextInput
            placeholder="Enter Code"
            value={code}
            onChangeText={text => setCode(text)}
            style={{padding: 10, borderWidth: 1, borderRadius: 5}}
          />
        </View>
        {error ? (
          <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>
        ) : null}
        <Button title="Verify" onPress={verifyCode} />
      </View>
    </View>
  );
};
export default App;
