import { useState } from 'react';
import { Database, Plus, Minus, Edit } from 'lucide-react';
import { getAllDatapoints, saveEnabledDatapoints, createDatapoint, deleteDatapoints, updateDatapoint, deleteCategory, resetDatapoints } from '../../api/datapoints';

export default function DatapointsSection({ 
    dataPointDefinitions, 
    setDataPointDefinitions, 
    enabledDatapoints, 
    setEnabledDatapoints 
}) {
    const [showAddDatapointForm, setShowAddDatapointForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newDatapoint, setNewDatapoint] = useState({
        name: '',
        label: '',
        type: 'boolean',
        min: 0,
        max: 100,
        step: 1
    });
    const [deleteMode, setDeleteMode] = useState({});
    const [stagedForDeletion, setStagedForDeletion] = useState({});
    const [editMode, setEditMode] = useState({});
    const [editingDatapoint, setEditingDatapoint] = useState(null);
    const [categoryDeleteMode, setCategoryDeleteMode] = useState(false);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [stagedCategoriesForDeletion, setStagedCategoriesForDeletion] = useState([]);

    const handleSaveDatapoints = async () => {
        try {
            await saveEnabledDatapoints(enabledDatapoints);
            alert('Datapoint configuration saved successfully!');
        } catch (err) {
            console.error('Failed to save datapoint configuration:', err);
            alert('Failed to save datapoint configuration. Please try again.');
        }
    };

    const handleCreateDatapoint = async () => {
        try {
            if (!newDatapoint.name.trim()) {
                alert('Please enter a name for the datapoint');
                return;
            }
            if (!newDatapoint.label.trim()) {
                alert('Please enter a label for the datapoint');
                return;
            }
            if (!newDatapoint.type) {
                alert('Please select a type for the datapoint');
                return;
            }
            if (!selectedCategory) {
                alert('Please select a category');
                return;
            }
            const result = await createDatapoint({
                ...newDatapoint,
                category: selectedCategory
            });
            const datapointData = await getAllDatapoints();
            setDataPointDefinitions(datapointData.definitions);
            setEnabledDatapoints(datapointData.preferences);
            setNewDatapoint({
                name: '',
                label: '',
                type: 'boolean',
                min: 0,
                max: 100,
                step: 1
            });
            setShowAddDatapointForm(false);
            setSelectedCategory('');
            alert('Datapoint created successfully!');
        } catch (err) {
            console.error('Failed to create datapoint:', err);
            alert(err.message || 'Failed to create datapoint. Please try again.');
        }
    };

    const handleDatapointChange = (field, value) => {
        setNewDatapoint(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddDatapoint = (category) => {
        setSelectedCategory(category);
        setShowAddDatapointForm(true);
    };

    const toggleDeleteMode = (category) => {
        setDeleteMode(prev => ({ ...prev, [category]: !prev[category] }));
        setStagedForDeletion(prev => ({ ...prev, [category]: [] }));
    };

    const handleDeleteDatapoint = (category, datapointKey) => {
        setStagedForDeletion(prev => {
            const staged = prev[category] || [];
            if (staged.includes(datapointKey)) {
                return { ...prev, [category]: staged.filter(dp => dp !== datapointKey) };
            } else {
                return { ...prev, [category]: [...staged, datapointKey] };
            }
        });
    };

    const handleSaveDeletions = async (category) => {
        const toDelete = stagedForDeletion[category] || [];
        if (toDelete.length === 0) {
            toggleDeleteMode(category);
            return;
        }

        const datapointLabels = toDelete.map(dpKey => dataPointDefinitions[category][dpKey].label).join(', ');
        if (confirm(`Are you sure you want to delete the following datapoint(s)?: \n\n${datapointLabels} \n\nThis action is permanent and cannot be undone.`)) {
            try {
                const datapointsToDelete = toDelete.map(name => ({ category, name }));
                await deleteDatapoints(datapointsToDelete);
                const datapointData = await getAllDatapoints();
                setDataPointDefinitions(datapointData.definitions);
                setEnabledDatapoints(datapointData.preferences);
                toggleDeleteMode(category);
                alert('Datapoints deleted successfully!');
            } catch (err) {
                console.error('Failed to delete datapoints:', err);
                alert(err.message || 'Failed to delete datapoints. Please try again.');
            }
        }
    };

    const toggleEditMode = (category) => {
        setEditMode(prev => ({ ...prev, [category]: !prev[category] }));
        setEditingDatapoint(null);
    };

    const handleEditDatapoint = (category, datapointKey) => {
        const datapoint = dataPointDefinitions[category][datapointKey];
        setEditingDatapoint({
            category,
            name: datapointKey,
            ...datapoint
        });
    };

    const handleUpdateDatapoint = async () => {
        if (!editingDatapoint) return;
        
        if (!editingDatapoint.name.trim()) {
            alert('Please enter a name for the datapoint');
            return;
        }
        if (!editingDatapoint.label.trim()) {
            alert('Please enter a label for the datapoint');
            return;
        }
        if (!editingDatapoint.type) {
            alert('Please select a type for the datapoint');
            return;
        }
        
        try {
            await updateDatapoint(editingDatapoint);
            const datapointData = await getAllDatapoints();
            setDataPointDefinitions(datapointData.definitions);
            setEnabledDatapoints(datapointData.preferences);
            setEditingDatapoint(null);
            alert('Datapoint updated successfully!');
        } catch (err) {
            console.error('Failed to update datapoint:', err);
            alert(err.message || 'Failed to update datapoint. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setEditingDatapoint(null);
    };

    const handleAddCategory = () => {
        if (newCategoryName.trim() === '') {
            alert('Please enter a category name.');
            return;
        }
        const newCategoryKey = newCategoryName.trim().toLowerCase().replace(/\s+/g, '');
        setDataPointDefinitions(prev => ({
            ...prev,
            [newCategoryKey]: {}
        }));
        setNewCategoryName('');
        setShowNewCategoryInput(false);
    };

    const toggleCategoryDeleteMode = () => {
        setCategoryDeleteMode(prev => !prev);
        setStagedCategoriesForDeletion([]);
    };

    const handleStageCategoryForDeletion = (categoryKey) => {
        setStagedCategoriesForDeletion(prev => {
            if (prev.includes(categoryKey)) {
                return prev.filter(c => c !== categoryKey);
            } else {
                return [...prev, categoryKey];
            }
        });
    };

    const handleSaveCategoryDeletions = async () => {
        if (stagedCategoriesForDeletion.length === 0) {
            toggleCategoryDeleteMode();
            return;
        }

        const categoryNames = stagedCategoriesForDeletion.join(', ');
        const confirmation = prompt(`Type the names of the categories you want to delete, separated by commas, to confirm: ${categoryNames}`);

        if (confirmation === categoryNames) {
            try {
                await Promise.all(stagedCategoriesForDeletion.map(category => deleteCategory(category)));
                const datapointData = await getAllDatapoints();
                setDataPointDefinitions(datapointData.definitions);
                setEnabledDatapoints(datapointData.preferences);
                toggleCategoryDeleteMode();
                alert('Categories deleted successfully!');
            } catch (err) {
                console.error('Failed to delete categories:', err);
                alert(err.message || 'Failed to delete categories. Please try again.');
            }
        } else {
            alert('The names you entered did not match. Deletion cancelled.');
        }
    };

    const handleResetDatapoints = async () => {
        const confirmation = confirm('Are you sure you want to reset datapoints to the default list? This will remove any custom datapoints you\'ve created, but preserve your data for standard datapoints. This action cannot be undone.');
        
        if (confirmation) {
            try {
                const result = await resetDatapoints();
                const datapointData = await getAllDatapoints();
                setDataPointDefinitions(datapointData.definitions);
                setEnabledDatapoints(datapointData.preferences);
                
                let message = 'Datapoints reset to default successfully!';
                if (result.deletedCustom > 0 || result.addedMissing > 0) {
                    message += `\n\n- Removed ${result.deletedCustom} custom datapoint${result.deletedCustom !== 1 ? 's' : ''}`;
                    message += `\n- Added ${result.addedMissing} missing default datapoint${result.addedMissing !== 1 ? 's' : ''}`;
                }
                alert(message);
            } catch (err) {
                console.error('Failed to reset datapoints:', err);
                alert(err.message || 'Failed to reset datapoints. Please try again.');
            }
        }
    };

    const handleToggleCategory = (category) => {
        setEnabledDatapoints(prev => {
            const newState = { ...prev };
            const currentValues = prev[category];
            const isAllEnabled = Object.values(currentValues).every(Boolean);
            const newValue = !isAllEnabled;
            newState[category] = {};
            Object.keys(dataPointDefinitions[category]).forEach(key => {
                newState[category][key] = newValue;
            });
            return newState;
        });
    };

    const handleToggleDatapoint = (category, datapoint) => {
        setEnabledDatapoints(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [datapoint]: !prev[category][datapoint]
            }
        }));
    };

    const getCategoryButtonText = (categoryKey) => {
        const categoryValues = enabledDatapoints[categoryKey];
        if (!categoryValues) return 'Enable All';
        return Object.values(categoryValues).every(Boolean) ? 'Disable All' : 'Enable All';
    };

    const categoryNames = Object.keys(dataPointDefinitions).map(key => ({
        key,
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                        Datapoints Configuration
                    </h2>
                    <p className="text-gray-300">
                        Choose which datapoints to include in your daily logs
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        className="p-2 rounded-md hover:bg-gray-600 transition-colors"
                        onClick={() => setShowNewCategoryInput(prev => !prev)}
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        className={`p-2 rounded-md hover:bg-gray-600 transition-colors ${categoryDeleteMode ? 'bg-red-500/50' : ''}`}
                        onClick={toggleCategoryDeleteMode}
                    >
                        {categoryDeleteMode ? <span className="text-xs">Back</span> : <Minus size={16} />}
                    </button>
                </div>
            </div>
            {showNewCategoryInput && (
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                        placeholder="Enter new category name"
                    />
                    <button
                        onClick={handleAddCategory}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            )}
            <div className="space-y-6">
                {categoryNames.map(({ key, name }) => (
                    <div 
                        key={key} 
                        className={`border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 ${categoryDeleteMode ? (stagedCategoriesForDeletion.includes(key) ? 'bg-red-500/40' : 'bg-gray-900/50') : ''}`}
                        onClick={() => categoryDeleteMode && handleStageCategoryForDeletion(key)}
                    >
                        <div className="p-4 bg-gray-700 border-b border-gray-600">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-medium text-white">
                                    {name}
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="p-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                                        onClick={() => handleAddDatapoint(key)}
                                        disabled={deleteMode[key] || editMode[key] || categoryDeleteMode}
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        className={`p-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 ${deleteMode[key] ? 'bg-red-500/50' : ''}`}
                                        onClick={() => toggleDeleteMode(key)}
                                        disabled={showAddDatapointForm || editMode[key] || categoryDeleteMode}
                                    >
                                        {deleteMode[key] ? <span className="text-xs">Back</span> : <Minus size={16} />}
                                    </button>
                                    <button
                                        className={`p-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 ${editMode[key] ? 'bg-blue-500/50' : ''}`}
                                        onClick={() => toggleEditMode(key)}
                                        disabled={deleteMode[key] || showAddDatapointForm || categoryDeleteMode}
                                    >
                                        {editMode[key] ? <span className="text-xs">Back</span> : <Edit size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {editMode[key] && editingDatapoint && editingDatapoint.category === key && (
                            <div className="p-4 border-b border-gray-600 bg-gray-800">
                                <h5 className="text-md font-medium text-white mb-3">
                                    Editing {editingDatapoint.label}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editingDatapoint.name}
                                            onChange={(e) => setEditingDatapoint(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            No spaces. This is the internal variable name.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Label
                                        </label>
                                        <input
                                            type="text"
                                            value={editingDatapoint.label}
                                            onChange={(e) => setEditingDatapoint(prev => ({ ...prev, label: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            This is what users will see in the interface.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Type
                                        </label>
                                        <select
                                            value={editingDatapoint.type}
                                            onChange={(e) => setEditingDatapoint(prev => ({ ...prev, type: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                        >
                                            <option value="boolean">Yes/No</option>
                                            <option value="number">Number</option>
                                            <option value="time">Time</option>
                                            <option value="text">Text</option>
                                        </select>
                                    </div>
                                    {editingDatapoint.type === 'number' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Minimum Value
                                                </label>
                                                <input
                                                    type="number"
                                                    value={editingDatapoint.min || 0}
                                                    onChange={(e) => setEditingDatapoint(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Maximum Value
                                                </label>
                                                <input
                                                    type="number"
                                                    value={editingDatapoint.max || 100}
                                                    onChange={(e) => setEditingDatapoint(prev => ({ ...prev, max: parseFloat(e.target.value) || 100 }))}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Step Size
                                                </label>
                                                <input
                                                    type="number"
                                                    value={editingDatapoint.step || 1}
                                                    onChange={(e) => setEditingDatapoint(prev => ({ ...prev, step: parseFloat(e.target.value) || 1 }))}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3 mt-4">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateDatapoint}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                        {showAddDatapointForm && selectedCategory === key && (
                            <div className="p-4 border-b border-gray-600 bg-gray-800">
                                <h5 className="text-md font-medium text-white mb-3">
                                    Add Datapoint to {name}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newDatapoint.name}
                                            onChange={(e) => handleDatapointChange('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                            placeholder=" e.g. meditationMinutes"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            No spaces. This will be the internal variable name.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Label
                                        </label>
                                        <input
                                            type="text"
                                            value={newDatapoint.label}
                                            onChange={(e) => handleDatapointChange('label', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                            placeholder="e.g., Meditation Minutes"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            This is what you will see in the interface.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Type
                                        </label>
                                        <select
                                            value={newDatapoint.type}
                                            onChange={(e) => handleDatapointChange('type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                        >
                                            <option value="boolean">Yes/No</option>
                                            <option value="number">Number</option>
                                            <option value="time">Time</option>
                                            <option value="text">Text</option>
                                        </select>
                                    </div>
                                    {newDatapoint.type === 'number' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Minimum Value
                                                </label>
                                                <input
                                                    type="number"
                                                    value={newDatapoint.min}
                                                    onChange={(e) => handleDatapointChange('min', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Maximum Value
                                                </label>
                                                <input
                                                    type="number"
                                                    value={newDatapoint.max}
                                                    onChange={(e) => handleDatapointChange('max', parseFloat(e.target.value) || 100)}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Step Size
                                                </label>
                                                <input
                                                    type="number"
                                                    value={newDatapoint.step}
                                                    onChange={(e) => handleDatapointChange('step', parseFloat(e.target.value) || 1)}
                                                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3 mt-4">
                                    <button
                                        onClick={() => {
                                            setShowAddDatapointForm(false);
                                            setSelectedCategory('');
                                        }}
                                        className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateDatapoint}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Create Datapoint
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="p-4 bg-gray-800/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(dataPointDefinitions[key] || {}).map(([datapointKey, definition]) => {
                                    const isEnabled = enabledDatapoints[key]?.[datapointKey] || false;
                                    const isStagedForDeletion = stagedForDeletion[key]?.includes(datapointKey);
                                    const isInDeleteMode = deleteMode[key];
                                    const isInEditMode = editMode[key];

                                    return (
                                        <div 
                                            key={datapointKey} 
                                            onClick={() => {
                                                if (isInDeleteMode) {
                                                    handleDeleteDatapoint(key, datapointKey);
                                                } else if (isInEditMode) {
                                                    handleEditDatapoint(key, datapointKey);
                                                } else {
                                                    handleToggleDatapoint(key, datapointKey);
                                                }
                                            }}
                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                                                isInDeleteMode
                                                    ? isStagedForDeletion
                                                        ? 'bg-red-500/40 hover:bg-red-500/60 text-white'
                                                        : 'bg-gray-900/50 hover:bg-gray-900/70 text-gray-500'
                                                    : isInEditMode
                                                        ? 'bg-blue-500/40 hover:bg-blue-500/60 text-white'
                                                        : isEnabled 
                                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                                            : 'bg-gray-800 hover:bg-gray-700 text-gray-500'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3 flex-1">
                                                <span className={`text-sm font-medium ${
                                                    isEnabled || isStagedForDeletion ? 'text-gray-300' : 'text-gray-500'
                                                }`}>
                                                    {definition.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {deleteMode[key] && (
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => handleSaveDeletions(key)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Save Deletions
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {categoryDeleteMode && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSaveCategoryDeletions}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Save Category Deletions
                        </button>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center">
                <button
                    onClick={handleResetDatapoints}
                    className="px-4 py-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-gray-300 transition-colors text-sm"
                >
                    Reset to Default
                </button>
                <button
                    onClick={handleSaveDatapoints}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    Save Configuration
                </button>
            </div>
        </div>
    );
} 