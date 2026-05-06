import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FileAttachment } from '../store/types';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslations } from '../hooks/useTranslations';
import { getFileIcon, openFile, formatFileSize } from '../utils/attachments';

const MAX_VISIBLE = 2;

// ─── Single chip (Static, delegated animation to parent card) ───────────────

interface ChipProps {
  attachment: FileAttachment;
  onPress: () => void;
  onLongPress?: () => void;
  textColor: string;
  accentColor: string;
  isRTL: boolean;
}

const AttachmentChip: React.FC<ChipProps> = ({ attachment, onPress, onLongPress, textColor, accentColor, isRTL }) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip, 
        { 
          backgroundColor: 'rgba(255,255,255,0.04)', 
          borderColor: accentColor + '20',
          borderLeftColor: accentColor,
          borderLeftWidth: 3 
        },
        isRTL && { borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: accentColor, flexDirection: 'row-reverse' }
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      <MaterialCommunityIcons 
        name={getFileIcon(attachment.mimeType) as any} 
        size={12} 
        color={accentColor} 
        style={{ opacity: 0.8, marginLeft: isRTL ? 4 : 0, marginRight: isRTL ? 0 : 4 }} 
      />
      <Text style={[styles.chipText, { color: textColor, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1} ellipsizeMode="tail">
        {attachment.name}
      </Text>
    </TouchableOpacity>
  );
};

// ─── Full attachment row in the "view all" modal ─────────────────────────────

interface RowProps {
  attachment: FileAttachment;
  accentColor: string;
  textColor: string;
  onOpen: () => void;
  onDelete?: () => void;
  isRTL: boolean;
}

const AttachmentRow: React.FC<RowProps> = ({ attachment, accentColor, textColor, onOpen, onDelete, isRTL }) => (
  <TouchableOpacity 
    style={[styles.rowItem, isRTL && { flexDirection: 'row-reverse' }]} 
    onPress={onOpen} 
    activeOpacity={0.75}
  >
    <View style={[styles.rowIconBg, { backgroundColor: accentColor + '15' }]}>
      <MaterialCommunityIcons name={getFileIcon(attachment.mimeType) as any} size={22} color={accentColor} />
    </View>
    <View style={[styles.rowTextBlock, isRTL && { alignItems: 'flex-end', paddingRight: 0, paddingLeft: 12 }]}>
      <Text style={[styles.rowName, { color: textColor, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1} ellipsizeMode="middle">
        {attachment.name}
      </Text>
      <Text style={[styles.rowSize, { color: textColor, opacity: 0.4 }]}>{formatFileSize(attachment.size)}</Text>
    </View>
    {onDelete && (
      <TouchableOpacity onPress={onDelete} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ff4444" style={{ opacity: 0.7 }} />
      </TouchableOpacity>
    )}
    <MaterialCommunityIcons 
      name={isRTL ? "chevron-left" : "chevron-right"} 
      size={20} 
      color={textColor} 
      style={{ opacity: 0.1, marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }} 
    />
  </TouchableOpacity>
);

// ─── Main component ──────────────────────────────────────────────────────────

interface AttachmentListProps {
  attachments: FileAttachment[];
  onRemove?: (id: string) => void;
  isReadOnly?: boolean;
  accentColor: string;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onRemove,
  isReadOnly = false,
  accentColor,
}) => {
  const { getActiveTheme } = useSettingsStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const [viewAllVisible, setViewAllVisible] = useState(false);

  if (!attachments || attachments.length === 0) return null;

  const visible = attachments.slice(0, MAX_VISIBLE);
  const hiddenCount = attachments.length - MAX_VISIBLE;

  const handleOpen = (att: FileAttachment) => openFile(att.uri, att.mimeType);

  const handleLongPress = (att: FileAttachment) => {
    if (isReadOnly || !onRemove) return;
    Alert.alert(
      t('removeAttachment'),
      att.name,
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => onRemove(att.id) },
      ]
    );
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={[styles.content, isRTL && { flexDirection: 'row-reverse' }]}
      >
        {visible.map((att) => (
          <AttachmentChip
            key={att.id}
            attachment={att}
            textColor={theme.colors.text}
            accentColor={accentColor}
            onPress={() => setViewAllVisible(true)}
            onLongPress={() => handleLongPress(att)}
            isRTL={isRTL}
          />
        ))}

        {hiddenCount > 0 && (
          <TouchableOpacity
            style={[
              styles.moreBadge, 
              { 
                backgroundColor: 'rgba(255,255,255,0.03)', 
                borderColor: accentColor + '20',
                borderLeftColor: accentColor,
                borderLeftWidth: 3 
              },
              isRTL && { borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: accentColor, flexDirection: 'row-reverse' }
            ]}
            onPress={() => setViewAllVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.moreText, { color: theme.colors.text, opacity: 0.6 }]}>
              {isRTL ? `+${hiddenCount} ${t('moreAttachments')}` : `+${hiddenCount} ${t('moreAttachments')}`}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* View All modal */}
      <Modal visible={viewAllVisible} transparent animationType="slide" onRequestClose={() => setViewAllVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setViewAllVisible(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.colors.cardStart }]}>
            <TouchableOpacity activeOpacity={1}>
              <View style={[styles.sheetHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                  {t('allAttachments')} ({attachments.length})
                </Text>
                <TouchableOpacity onPress={() => setViewAllVisible(false)} hitSlop={15}>
                  <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} style={{ opacity: 0.5 }} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={attachments}
                keyExtractor={(a) => a.id}
                renderItem={({ item }) => (
                  <AttachmentRow
                    attachment={item}
                    accentColor={accentColor}
                    textColor={theme.colors.text}
                    onOpen={() => { setViewAllVisible(false); setTimeout(() => handleOpen(item), 300); }}
                    onDelete={!isReadOnly && onRemove ? () => onRemove(item.id) : undefined}
                    isRTL={isRTL}
                  />
                )}
                style={{ maxHeight: 500 }}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  content: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 150,
  },
  chipText: {
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
    flex: 1,
  },
  moreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 10,
    fontFamily: 'DMSans_700Bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 18,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  rowIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTextBlock: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
  },
  rowSize: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
  },
  separator: {
    height: 1,
  },
});
