import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Plus, Trash2, BookOpen, ChevronDown, ChevronRight, Save, X } from 'lucide-react-native';
import API from '../api/axios';
import { t } from '../utils/translation';

const AdminModulesScreen = ({ navigation }) => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedMod, setExpandedMod] = useState(null);
    const [showAddMod, setShowAddMod] = useState(false);
    const [newMod, setNewMod] = useState({ title: '', description: '', code: '', order: 10 });
    const [saving, setSaving] = useState(false);

    const fetchModules = async () => {
        try {
            const res = await API.get('/modules');
            setModules(res.data);
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch modules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, []);

    const handleEditModule = (mod) => {
        setNewMod({ title: mod.title, description: mod.description, code: mod.code, order: mod.order, _id: mod._id });
        setShowAddMod(true);
    };

    const handleSaveModule = async () => {
        if (!newMod.title || !newMod.code) return Alert.alert('Error', 'Title and Code are required');
        setSaving(true);
        try {
            if (newMod._id) {
                await API.patch(`/admin/modules/${newMod._id}`, newMod);
                Alert.alert('Success', 'Module updated');
            } else {
                await API.post('/admin/modules', newMod);
                Alert.alert('Success', 'Module created');
            }
            setShowAddMod(false);
            setNewMod({ title: '', description: '', code: '', order: 10 });
            fetchModules();
        } catch (err) {
            Alert.alert('Error', 'Failed to save module');
        } finally {
            setSaving(false);
        }
    };

    const editTopic = (modId, tIdx, currentTitle) => {
        Alert.prompt('Edit Topic', 'Enter new title', async (title) => {
            if (!title) return;
            try {
                await API.patch(`/admin/modules/${modId}/topics/${tIdx}`, { title });
                fetchModules();
            } catch (err) {
                Alert.alert('Error', 'Failed to update topic');
            }
        }, 'plain-text', currentTitle);
    };

    const editLesson = (modId, tIdx, sIdx, st) => {
        // Simple prompt for title, we could do more for content
        Alert.prompt('Edit Lesson', 'Enter new title', async (title) => {
            if (!title) return;
            try {
                await API.patch(`/admin/modules/${modId}/topics/${tIdx}/subtopics/${sIdx}`, { title });
                fetchModules();
            } catch (err) {
                Alert.alert('Error', 'Failed to update lesson');
            }
        }, 'plain-text', st.title);
    };

    const deleteTopic = (modId, tIdx) => {
        Alert.alert('Delete Topic', 'Are you sure?', [
            { text: 'Cancel' },
            { 
                text: 'Delete', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await API.delete(`/admin/modules/${modId}/topics/${tIdx}`);
                        fetchModules();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete topic');
                    }
                }
            }
        ]);
    };

    const deleteLesson = (modId, tIdx, sIdx) => {
        Alert.alert('Delete Lesson', 'Are you sure?', [
            { text: 'Cancel' },
            { 
                text: 'Delete', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await API.delete(`/admin/modules/${modId}/topics/${tIdx}/subtopics/${sIdx}`);
                        fetchModules();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete lesson');
                    }
                }
            }
        ]);
    };

    const handleDeleteModule = (id) => {
// ... existing delete logic ...
        Alert.alert('Delete Module', 'Are you sure? All topics within will be lost.', [
            { text: 'Cancel' },
            { 
                text: 'Delete', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await API.delete(`/admin/modules/${id}`);
                        fetchModules();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete module');
                    }
                }
            }
        ]);
    };

    const addTopic = (modId) => {
        Alert.prompt('New Topic', 'Enter topic title', async (title) => {
            if (!title) return;
            try {
                await API.post(`/admin/modules/${modId}/topics`, { title });
                fetchModules();
            } catch (err) {
                Alert.alert('Error', 'Failed to add topic');
            }
        });
    };

    const addLesson = (modId, topicIdx) => {
        Alert.prompt('New Lesson', 'Enter lesson title', async (title) => {
            if (!title) return;
            try {
                await API.post(`/admin/modules/${modId}/topics/${topicIdx}/subtopics`, { 
                    title, 
                    content: 'Lesson content goes here...' 
                });
                fetchModules();
            } catch (err) {
                Alert.alert('Error', 'Failed to add lesson');
            }
        });
    };

    if (loading) return <View style={styles.loading}><ActivityIndicator color="#7c3aed" /></View>;

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Modules</Text>
                <TouchableOpacity onPress={() => setShowAddMod(true)} style={styles.addBtn}>
                    <Plus size={20} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {modules.map((mod) => (
                    <View key={mod._id} style={styles.modCard}>
                        <TouchableOpacity 
                            style={styles.modHeader}
                            onPress={() => setExpandedMod(expandedMod === mod._id ? null : mod._id)}
                        >
                            <BookOpen size={20} color="#7c3aed" />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.modTitle}>{mod.title}</Text>
                                <Text style={styles.modSub}>{mod.topics?.length || 0} Topics • {mod.code}</Text>
                            </View>
                            <TouchableOpacity style={{ marginRight: 15 }} onPress={() => handleEditModule(mod)}>
                                <Save size={18} color="#7c3aed" /> 
                            </TouchableOpacity>
                            {expandedMod === mod._id ? <ChevronDown size={20} color="rgba(255,255,255,0.4)" /> : <ChevronRight size={20} color="rgba(255,255,255,0.4)" />}
                        </TouchableOpacity>

                        {expandedMod === mod._id && (
                            <View style={styles.modExpanded}>
                                {mod.topics?.map((topic, tIdx) => (
                                    <View key={tIdx} style={styles.topicItem}>
                                        <View style={styles.row}>
                                            <Text style={styles.topicTitle}>{topic.title}</Text>
                                            <TouchableOpacity onPress={() => editTopic(mod._id, tIdx, topic.title)} style={{ marginLeft: 8 }}>
                                                <Save size={14} color="rgba(255,255,255,0.3)" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => deleteTopic(mod._id, tIdx)} style={{ marginLeft: 8 }}>
                                                <Trash2 size={14} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.lessonList}>
                                            {topic.subTopics?.map((st, sIdx) => (
                                                <View key={sIdx} style={[styles.row, { justifyContent: 'space-between' }]}>
                                                    <TouchableOpacity style={styles.lessonItem} onPress={() => editLesson(mod._id, tIdx, sIdx, st)}>
                                                        <Text style={styles.lessonName}>{st.title}</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => deleteLesson(mod._id, tIdx, sIdx)}>
                                                        <X size={14} color="rgba(255,255,255,0.2)" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                            <TouchableOpacity style={styles.addLessonBtn} onPress={() => addLesson(mod._id, tIdx)}>
                                                <Plus size={14} color="#7c3aed" />
                                                <Text style={styles.addLessonText}>Add Lesson</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                                <View style={styles.modActions}>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => addTopic(mod._id)}>
                                        <Plus size={16} color="#10b981" />
                                        <Text style={[styles.actionText, { color: '#10b981' }]}>Add Topic</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteModule(mod._id)}>
                                        <Trash2 size={16} color="#ef4444" />
                                        <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete Module</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            <Modal visible={showAddMod} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalBody}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Module</Text>
                            <TouchableOpacity onPress={() => setShowAddMod(false)}><X size={24} color="white" /></TouchableOpacity>
                        </View>
                        <TextInput 
                            placeholder="Module Title" 
                            placeholderTextColor="rgba(255,255,255,0.3)" 
                            style={styles.input} 
                            value={newMod.title}
                            onChangeText={(t) => setNewMod({...newMod, title: t})}
                        />
                        <TextInput 
                            placeholder="Description" 
                            placeholderTextColor="rgba(255,255,255,0.3)" 
                            style={[styles.input, { height: 80 }]} 
                            multiline
                            value={newMod.description}
                            onChangeText={(t) => setNewMod({...newMod, description: t})}
                        />
                        <View style={styles.row}>
                             <TextInput 
                                placeholder="Code (e.g. MOD_WORK)" 
                                placeholderTextColor="rgba(255,255,255,0.3)" 
                                style={[styles.input, { flex: 1, marginRight: 10 }]} 
                                value={newMod.code}
                                onChangeText={(t) => setNewMod({...newMod, code: t})}
                            />
                             <TextInput 
                                placeholder="Order" 
                                placeholderTextColor="rgba(255,255,255,0.3)" 
                                style={[styles.input, { width: 80 }]} 
                                keyboardType="numeric"
                                value={String(newMod.order)}
                                onChangeText={(t) => setNewMod({...newMod, order: Number(t)})}
                            />
                        </View>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveModule} disabled={saving}>
                            {saving ? <ActivityIndicator color="white" /> : <><Save size={20} color="white" /><Text style={styles.saveBtnText}>Create Module</Text></>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    header: { height: 110, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    addBtn: { width: 40, height: 40, backgroundColor: '#7c3aed', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: 20, gap: 15, paddingBottom: 50 },
    modCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
    modHeader: { padding: 16, flexDirection: 'row', alignItems: 'center' },
    modTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
    modSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    modExpanded: { padding: 16, paddingTop: 0, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    topicItem: { marginTop: 15 },
    topicTitle: { color: '#a78bfa', fontSize: 14, fontWeight: '700', marginBottom: 8 },
    lessonList: { paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)', gap: 8 },
    lessonItem: { paddingVertical: 4 },
    lessonName: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
    addLessonBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    addLessonText: { color: '#7c3aed', fontSize: 12, fontWeight: '600' },
    modActions: { flexDirection: 'row', gap: 15, marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 15 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionText: { fontSize: 12, fontWeight: '700' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    modalBody: { backgroundColor: '#1a1744', borderRadius: 25, padding: 20, gap: 15 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    modalTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
    input: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 15, color: 'white', fontSize: 15 },
    row: { flexDirection: 'row' },
    saveBtn: { backgroundColor: '#7c3aed', height: 50, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
    saveBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
    loading: { flex: 1, backgroundColor: '#0f0c29', justifyContent: 'center', alignItems: 'center' }
});

export default AdminModulesScreen;
