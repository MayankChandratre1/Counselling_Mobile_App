import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getUserData, storeUserData } from '../../utils/storage'
import Icon from 'react-native-vector-icons/FontAwesome'
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons'

interface FormField {
  label: string;
  key: string;
  value: string;
  isEditing: boolean;
}

const ProfileForm = () => {
  const [fields, setFields] = useState<FormField[]>([
    { label: 'Name', key: 'name', value: '', isEditing: false },
    { label: 'State', key: 'state', value: '', isEditing: false },
    { label: 'Field', key: 'field', value: '', isEditing: false },
    { label: 'Marks in JEE', key: 'jeeMarks', value: '', isEditing: false },
    { label: 'Marks in CET', key: 'cetMarks', value: '', isEditing: false },
    { label: 'Preferred Location', key: 'prefferedlocation', value: '', isEditing: false },
  ]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await getUserData();
    if (data) {
      setFields(fields.map(field => ({
        ...field,
        value: data[field.key] || '',
      })));
    }
  };

  const toggleEdit = (index: number) => {
    const newFields = [...fields];
    newFields[index].isEditing = !newFields[index].isEditing;
    setFields(newFields);

    if (!newFields[index].isEditing) {
      // Save when finishing edit
      storeUserData({ [newFields[index].key]: newFields[index].value });
    }
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index].value = value;
    setFields(newFields);
  };

  return (
    <View style={styles.container}>
      {fields.map((field, index) => (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.label}>{field.label}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, !field.isEditing && styles.inputDisabled]}
              value={field.value}
              onChangeText={(value) => updateField(index, value)}
              editable={field.isEditing}
            />
            <TouchableOpacity 
              onPress={() => toggleEdit(index)}
              style={styles.editButton}
            >
              {
                !field.isEditing 
                ? <Icon2 name="pencil-circle" size={28} color="#B4DBFF" />
                : <Icon name="check" size={24} color="#333" />
              }
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

export default ProfileForm;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  inputDisabled: {
    backgroundColor: '#fff',
  },
  editButton: {
    padding: 12,
  },
});