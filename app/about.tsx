import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/useSettingsStore';
import { getGlobalStyles } from '../theme/theme';
import { GlobalHeader } from '../components/GlobalHeader';
import { APP_CONFIG } from '../constants/Config';
import { useTranslations } from '../hooks/useTranslations';

const AboutScreen = () => {
  const router = useRouter();
  const { getActiveTheme } = useSettingsStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const features = [
    { icon: 'target', title: t('f1Title'), desc: t('f1Desc') },
    { icon: 'view-column-outline', title: t('f2Title'), desc: t('f2Desc') },
    { icon: 'bell-ring-outline', title: t('f3Title'), desc: t('f3Desc') },
    { icon: 'palette-outline', title: t('f4Title'), desc: t('f4Desc') },
  ];

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title={t('about')} showBack />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoBg}>
            <Image source={require('../assets/icon.png')} style={{ width: 120, height: 120, borderRadius: 30 }} />
          </View>
          <Text style={[globalStyles.heading, styles.appName]}>{APP_CONFIG.NAME.toUpperCase()}</Text>
          <Text style={[globalStyles.text, styles.version]}>{t('version')} {APP_CONFIG.VERSION}</Text>
          <Text style={[globalStyles.text, styles.tagline]}>{t('visionDesc')}</Text>
        </View>

        {/* Vision Section */}
        <View style={[styles.section, { backgroundColor: 'rgba(255,255,255,0.02)' }]}>
          <Text style={[globalStyles.subHeading, styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('vision')}</Text>
          <Text style={[globalStyles.text, styles.sectionDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('visionDesc')}
          </Text>
        </View>

        {/* Features Grid */}
        <View style={[styles.featuresGrid, isRTL && { flexDirection: 'row-reverse' }]}>
          {features.map((f, i) => (
            <View key={i} style={[styles.featureCard, { backgroundColor: theme.colors.cardStart, alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <MaterialCommunityIcons name={f.icon as any} size={28} color={theme.colors.done} />
              <Text style={[globalStyles.subHeading, styles.featureTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{f.title}</Text>
              <Text style={[globalStyles.text, styles.featureDesc, { textAlign: isRTL ? 'right' : 'left' }]}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Socials / Footer */}
        <View style={styles.footer}>
          <Text style={[globalStyles.text, { opacity: 0.5, marginBottom: 16 }]}>{t('handcrafted')}</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL(APP_CONFIG.AUTHOR.GITHUB)}>
              <MaterialCommunityIcons name="github" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL(APP_CONFIG.AUTHOR.LINKEDIN)}>
              <MaterialCommunityIcons name="linkedin" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={[globalStyles.text, styles.copyright]}>© 2026 {t('copyright')}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBg: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: {
    fontSize: 32,
    letterSpacing: 4,
    fontFamily: 'Syne_800ExtraBold',
  },
  version: {
    fontSize: 12,
    opacity: 0.5,
    fontFamily: 'DMSans_700Bold',
    marginTop: 4,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.8,
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
  },
  sectionDesc: {
    lineHeight: 24,
    opacity: 0.7,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 40,
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featureTitle: {
    fontSize: 15,
    marginTop: 12,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyright: {
    fontSize: 11,
    opacity: 0.3,
  },
});

export default AboutScreen;
