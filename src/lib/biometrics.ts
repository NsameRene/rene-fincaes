import { BiometricAuth, BiometryType, BiometryError, BiometryErrorType } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

export interface BiometricStatus {
  isAvailable: boolean;
  biometryType: BiometryType;
  typeName: string; // e.g. "Fingerprint", "Face ID", "Touch ID", "Biometrics"
  deviceIsSecure: boolean;
  reason?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  fallbackToPin?: boolean;
}

export function getBiometryTypeName(type: BiometryType): string {
  switch (type) {
    case BiometryType.fingerprintAuthentication:
      return 'Fingerprint';
    case BiometryType.faceAuthentication:
    case BiometryType.faceId:
      return 'Face ID';
    case BiometryType.touchId:
      return 'Touch ID';
    case BiometryType.irisAuthentication:
      return 'Iris Scanner';
    default:
      return 'Biometrics';
  }
}

/**
 * Checks if biometric authentication is available on this device
 */
export async function checkBiometrics(): Promise<BiometricStatus> {
  try {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const result = await BiometricAuth.checkBiometry();
      return {
        isAvailable: result.isAvailable,
        biometryType: result.biometryType,
        typeName: getBiometryTypeName(result.biometryType),
        deviceIsSecure: result.deviceIsSecure,
        reason: result.reason,
      };
    }

    // In web / PWA / preview environment
    if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return {
        isAvailable: available,
        biometryType: BiometryType.fingerprintAuthentication,
        typeName: 'Fingerprint / Face ID',
        deviceIsSecure: true,
      };
    }

    // Web simulation is enabled by default in @aparajita/capacitor-biometric-auth
    const simResult = await BiometricAuth.checkBiometry();
    return {
      isAvailable: simResult.isAvailable || true,
      biometryType: simResult.biometryType || BiometryType.fingerprintAuthentication,
      typeName: 'Fingerprint Sensor',
      deviceIsSecure: true,
    };
  } catch (err: any) {
    console.warn('Biometric availability check warning:', err);
    return {
      isAvailable: false,
      biometryType: BiometryType.none,
      typeName: 'Biometrics',
      deviceIsSecure: false,
      reason: err?.message || 'Biometric hardware unavailable',
    };
  }
}

/**
 * Prompts the user with device-native biometric prompt (Fingerprint / Face ID)
 */
export async function promptBiometricAuth(options?: {
  reason?: string;
  cancelTitle?: string;
}): Promise<AuthResult> {
  const reason = options?.reason || 'Verify your identity to unlock Rene Finance';
  const cancelTitle = options?.cancelTitle || 'Use PIN';

  try {
    await BiometricAuth.authenticate({
      reason,
      cancelTitle,
      androidTitle: 'Rene Finance Biometric Unlock',
      androidSubtitle: 'Confirm your fingerprint or face to proceed',
      androidConfirmationRequired: false,
      allowDeviceCredential: false, // ensures fallback route goes through Rene's secure PIN vault
    });

    return { success: true };
  } catch (err: any) {
    console.log('Biometric authentication failed or was cancelled:', err);

    if (err instanceof BiometryError || err?.code) {
      const code = err.code as BiometryErrorType;
      if (
        code === BiometryErrorType.userFallback ||
        code === BiometryErrorType.userCancel ||
        code === BiometryErrorType.appCancel
      ) {
        return {
          success: false,
          fallbackToPin: true,
          error: 'User requested PIN fallback',
        };
      }
      if (code === BiometryErrorType.biometryLockout) {
        return {
          success: false,
          fallbackToPin: true,
          error: 'Biometric attempts locked out. Please use your PIN.',
        };
      }
      if (code === BiometryErrorType.biometryNotEnrolled) {
        return {
          success: false,
          fallbackToPin: true,
          error: 'No biometric credentials enrolled on device.',
        };
      }
    }

    return {
      success: false,
      fallbackToPin: true,
      error: err?.message || 'Biometric verification did not succeed',
    };
  }
}
