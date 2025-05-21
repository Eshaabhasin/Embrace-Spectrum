import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Noto Sans',
  fonts: [
    {
      src: '/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf',
    },
    {
      src: '/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf',
      fontWeight: 'bold',
    }
  ]
});

Font.register({
  family: 'Noto Sans Hindi',
  src: '/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Noto Sans',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#663399',
    fontFamily: 'Noto Sans',
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 14,
    marginBottom: 10,
    color: '#4B0082',
    fontFamily: 'Noto Sans',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
  },
  metaInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F8F8FF',
    borderRadius: 5,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  metaLabel: {
    width: 100,
    color: '#4B0082',
    fontFamily: 'Noto Sans',
    fontWeight: 'bold',
  },
  metaValue: {
    flex: 1,
    fontFamily: 'Noto Sans Hindi', // Use Hindi font for values
  },
  content: {
    lineHeight: 1.5,
    textAlign: 'justify',
    fontFamily: 'Noto Sans Hindi', // Use Hindi font for content
  },
  weekHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: '#E6E6FA',
    padding: 5,
    borderRadius: 3,
    fontFamily: 'Noto Sans',
  },
  bulletPoint: {
    marginLeft: 10,
    marginBottom: 5,
    fontFamily: 'Noto Sans Hindi', // Use Hindi font for bullet points
  },
});

const LearningPathPDF = ({ formData, response }) => {
  const processContent = (text) => {
    const weeks = text.split(/Week \d+:|सप्ताह \d+:/g).filter(Boolean);
    return weeks.map((week, index) => ({
      weekNumber: index + 1,
      content: week.trim(),
    }));
  };

  const getWeekLabel = (number) => {
    return formData.preferred_language === 'Hindi' 
      ? `सप्ताह ${number}`
      : `Week ${number}`;
  };

  const weeks = processContent(response);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>
          {formData.preferred_language === 'Hindi' ? 'वित्तीय शिक्षा योजना' : 'Financial Education Plan'}
        </Text>
        
        <View style={styles.metaInfo}>
          <Text style={styles.subHeader}>
            {formData.preferred_language === 'Hindi' ? 'उपयोगकर्ता प्रोफ़ाइल' : 'User Profile'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>
              {formData.preferred_language === 'Hindi' ? 'भाषा:' : 'Language:'}
            </Text>
            <Text style={styles.metaValue}>{formData.preferred_language}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>
              {formData.preferred_language === 'Hindi' ? 'स्थान:' : 'Location:'}
            </Text>
            <Text style={styles.metaValue}>{formData.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>
              {formData.preferred_language === 'Hindi' ? 'आयु:' : 'Age:'}
            </Text>
            <Text style={styles.metaValue}>{formData.age}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>
              {formData.preferred_language === 'Hindi' ? 'स्तर:' : 'Level:'}
            </Text>
            <Text style={styles.metaValue}>{formData.learning_path_type}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>
              {formData.preferred_language === 'Hindi' ? 'विषय:' : 'Topic:'}
            </Text>
            <Text style={styles.metaValue}>{formData.learning_topic}</Text>
          </View>
        </View>

        {weeks.map((week, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.weekHeader}>{getWeekLabel(week.weekNumber)}</Text>
            <Text style={styles.content}>{week.content}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default LearningPathPDF;