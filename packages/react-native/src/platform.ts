export type IsolinePlatform = 'ios' | 'android';
/** Native follows the OS. Web can preview either design without spoofing Platform.OS. */
export function resolvePlatform(
  os: string,
  requested?: IsolinePlatform,
  inherited?: IsolinePlatform,
): IsolinePlatform {
  return os === 'ios'
    ? 'ios'
    : os === 'android'
      ? 'android'
      : (requested ?? inherited ?? 'android');
}
