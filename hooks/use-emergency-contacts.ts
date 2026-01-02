import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isFavorite: boolean;
};

const CONTACTS_STORAGE_KEY = "@asistente_senior_emergency_contacts";

export function useEmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load contacts from AsyncStorage
  const loadContacts = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
      if (stored) {
        setContacts(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load emergency contacts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save contacts to AsyncStorage
  const saveContacts = useCallback(async (newContacts: EmergencyContact[]) => {
    try {
      await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(newContacts));
      setContacts(newContacts);
    } catch (error) {
      console.error("Failed to save emergency contacts:", error);
    }
  }, []);

  // Add new contact
  const addContact = useCallback(
    async (contact: Omit<EmergencyContact, "id">) => {
      const newContact: EmergencyContact = {
        ...contact,
        id: Date.now().toString(),
      };
      const updated = [...contacts, newContact];
      await saveContacts(updated);
    },
    [contacts, saveContacts]
  );

  // Update contact
  const updateContact = useCallback(
    async (id: string, updates: Partial<EmergencyContact>) => {
      const updated = contacts.map((c) => {
        if (c.id === id) {
          return { ...c, ...updates };
        }
        return c;
      });
      await saveContacts(updated);
    },
    [contacts, saveContacts]
  );

  // Delete contact
  const deleteContact = useCallback(
    async (id: string) => {
      const updated = contacts.filter((c) => c.id !== id);
      await saveContacts(updated);
    },
    [contacts, saveContacts]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (id: string) => {
      const updated = contacts.map((c) => {
        if (c.id === id) {
          return { ...c, isFavorite: !c.isFavorite };
        }
        return c;
      });
      await saveContacts(updated);
    },
    [contacts, saveContacts]
  );

  // Get favorite contacts
  const getFavoriteContacts = useCallback(() => {
    return contacts.filter((c) => c.isFavorite);
  }, [contacts]);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  return {
    contacts,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    toggleFavorite,
    getFavoriteContacts,
  };
}
