import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/useSettingsStore';
import { getGlobalStyles } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalHeader } from '../components/GlobalHeader';

const AboutScreen = () => {
  const router = useRouter();
  const { getActiveTheme } = useSettingsStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const features = [
    { icon: 'target', title: 'Dynamic Objectives', desc: 'Break down your vision into achievable milestones.' },
    { icon: 'view-column-outline', title: 'Kanban Flow', desc: 'Visualize your progress with an industrial-grade board.' },
    { icon: 'bell-ring-outline', title: 'Smart Alerts', desc: 'Stay on track with precisely timed notifications.' },
    { icon: 'palette-outline', title: 'Premium Themes', desc: 'Experience productivity in high-contrast elegance.' },
  ];

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title="About Hadaf" showBack />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoBg}>
            <Image source={require('../assets/icon.png')} style={{ width: 120, height: 120, borderRadius: 30 }} />
          </View>
          <Text style={[globalStyles.heading, styles.appName]}>HADAF</Text>
          <Text style={[globalStyles.text, styles.version]}>Version 2.0.0 (Cosmic Edition)</Text>
          <Text style={[globalStyles.text, styles.tagline]}>Your vision, structured for success.</Text>
        </View>

        {/* Vision Section */}
        <View style={[styles.section, { backgroundColor: 'rgba(255,255,255,0.02)' }]}>
          <Text style={[globalStyles.subHeading, styles.sectionTitle]}>Our Vision</Text>
          <Text style={[globalStyles.text, styles.sectionDesc]}>
            Hadaf (Target) was built for those who find standard productivity tools too simple and traditional project managers too complex. We focus on high-contrast visuals and essential workflows to keep you in the flow state.
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((f, i) => (
            <View key={i} style={[styles.featureCard, { backgroundColor: theme.colors.cardStart }]}>
              <MaterialCommunityIcons name={f.icon as any} size={28} color={theme.colors.done} />
              <Text style={[globalStyles.subHeading, styles.featureTitle]}>{f.title}</Text>
              <Text style={[globalStyles.text, styles.featureDesc]}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Socials / Footer */}
        <View style={styles.footer}>
          <Text style={[globalStyles.text, { opacity: 0.5, marginBottom: 16 }]}>Handcrafted for excellence.</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://github.com/AmerZuher')}>
              <MaterialCommunityIcons name="github" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.linkedin.com/in/amer-zuher-alriyahi')}>
              <MaterialCommunityIcons name="linkedin" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={[globalStyles.text, styles.copyright]}>© 2026 Hadaf Productivity Systems</Text>
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
