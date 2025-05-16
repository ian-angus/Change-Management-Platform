import { FaEdit, FaTrash, FaUsers } from 'react-icons/fa';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [groups, setGroups] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('group'); // 'group' or 'employee'

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleAddClick = (project) => {
    setSelectedProject(project);
    fetchGroups();
    fetchEmployees();
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedProject(null);
    setSearchTerm('');
  };

  const handleAddToProject = async (item) => {
    if (!selectedProject) return;
    const endpoint = selectedType === 'group' ? `/api/projects/${selectedProject.id}/groups` : `/api/projects/${selectedProject.id}/stakeholders`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [selectedType === 'group' ? 'group_id' : 'employee_id']: item.id })
      });
      if (!response.ok) throw new Error(`Failed to add ${selectedType}`);
      alert(`${selectedType} added successfully!`);
      handleCloseModal();
    } catch (err) {
      console.error(`Error adding ${selectedType}:`, err);
      alert(`Error adding ${selectedType}. Please try again.`);
    }
  };

  const filteredItems = selectedType === 'group' 
    ? groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.job_position.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="project-list">
      <h1>Projects</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td>{project.name}</td>
              <td>{project.description}</td>
              <td>{project.status}</td>
              <td>
                <button onClick={() => handleAddClick(project)}><FaUsers /></button>
                <button onClick={() => handleEdit(project)}><FaEdit /></button>
                <button onClick={() => handleDelete(project.id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add to Project: {selectedProject.name}</h2>
            <div>
              <label>
                <input type="radio" checked={selectedType === 'group'} onChange={() => setSelectedType('group')} /> Group
              </label>
              <label>
                <input type="radio" checked={selectedType === 'employee'} onChange={() => setSelectedType('employee')} /> Employee
              </label>
            </div>
            <input
              type="text"
              placeholder={`Search ${selectedType}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul>
              {filteredItems.map(item => (
                <li key={item.id} onClick={() => handleAddToProject(item)}>
                  {item.name} {selectedType === 'employee' ? `(${item.job_position})` : ''}
                </li>
              ))}
            </ul>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectList; 