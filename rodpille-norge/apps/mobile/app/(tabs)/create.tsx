import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../../lib/auth'

const AVAILABLE_TAGS = [
  'Strømtyveri',
  'NRKPropaganda',
  'InnvandringKostnader',
  'Elitekorrupsjon',
  'Klimabløff',
  'MediaLøgn',
  'GjengKrim',
  'VåknOpp',
]

export default function CreateScreen() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          source_url: sourceUrl,
          tags: selectedTags,
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kunne ikke opprette post')
      }
      return response.json()
    },
    onSuccess: (data) => {
      Alert.alert(
        'Suksess',
        'Din post er opprettet! AI-faktasjekk kjører i bakgrunnen.',
        [{ text: 'OK', onPress: () => router.push(`/post/${data.post.id}`) }]
      )
    },
    onError: (error: Error) => {
      Alert.alert('Feil', error.message)
    },
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 5
        ? [...prev, tag]
        : prev
    )
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Feil', 'Tittel er påkrevd')
      return
    }
    if (!content.trim()) {
      Alert.alert('Feil', 'Innhold er påkrevd')
      return
    }
    if (!sourceUrl.trim()) {
      Alert.alert('Feil', 'Kilde-URL er påkrevd')
      return
    }

    try {
      new URL(sourceUrl)
    } catch {
      Alert.alert('Feil', 'Ugyldig URL')
      return
    }

    createPostMutation.mutate()
  }

  if (!user) {
    return (
      <View style={styles.authPrompt}>
        <Ionicons name="lock-closed" size={64} color="#666" />
        <Text style={styles.authPromptTitle}>Logg inn for å poste</Text>
        <Text style={styles.authPromptText}>
          Du må være innlogget og ha rød pille-status for å opprette innlegg.
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.authButtonText}>Logg inn</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>NY POST</Text>
        <Text style={styles.subheading}>
          Del sannheten. Husk å inkludere kilder!
        </Text>

        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tittel *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="En slagkraftig tittel..."
            placeholderTextColor="#666"
            maxLength={200}
          />
        </View>

        {/* Source URL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kilde-URL *</Text>
          <View style={styles.urlInputContainer}>
            <Ionicons name="link" size={18} color="#666" style={styles.urlIcon} />
            <TextInput
              style={[styles.input, styles.urlInput]}
              value={sourceUrl}
              onChangeText={setSourceUrl}
              placeholder="https://..."
              placeholderTextColor="#666"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
          <Text style={styles.hint}>
            Kilden vil bli faktasjekket av AI automatisk
          </Text>
        </View>

        {/* Content */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Innhold *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="Skriv ditt innlegg her... Markdown støttes!"
            placeholderTextColor="#666"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags (velg opp til 5)</Text>
          <View style={styles.tagsContainer}>
            {AVAILABLE_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.tagSelected,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextSelected,
                  ]}
                >
                  #{tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            createPostMutation.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createPostMutation.isPending}
        >
          {createPostMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.submitButtonText}>PUBLISER</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Ved å publisere godtar du våre vilkår. AI vil automatisk
          faktasjekke kilden og tagge innholdet.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 16,
  },
  heading: {
    color: '#fff',
    fontFamily: 'Inter-Black',
    fontSize: 24,
    marginBottom: 4,
  },
  subheading: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    padding: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urlIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  urlInput: {
    flex: 1,
    paddingLeft: 40,
  },
  textArea: {
    minHeight: 150,
  },
  hint: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#4b0000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#880c0c',
  },
  tagSelected: {
    backgroundColor: '#ff2323',
    borderColor: '#ff5757',
  },
  tagText: {
    color: '#ff5757',
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
  tagTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#ff2323',
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  disclaimer: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  authPrompt: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authPromptTitle: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  authPromptText: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#ff2323',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  authButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
})
