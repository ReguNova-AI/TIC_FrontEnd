import React, { useState, useMemo, useEffect } from "react";
import { Modal, Input, Button, List, Tag, Checkbox, Row, Col } from "antd";

const { Search } = Input;

const ProjectSelectionModal = ({
  visible,
  onClose,
  allProjects = [],
  onSubmit,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Correctly initialize with project_id
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);

  useEffect(() => {
    const initiallyAssigned = allProjects
      .filter((p) => p.is_external_project)
      .map((p) => p.project_id);
    setSelectedProjectIds(initiallyAssigned);
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) =>
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProjects, searchTerm]);

  const selectedProjects = useMemo(() => {
    return allProjects.filter((p) => selectedProjectIds.includes(p.project_id));
  }, [allProjects, selectedProjectIds]);

  const toggleSelection = (projectId) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const removeTag = (projectId) => {
    setSelectedProjectIds((prev) => prev.filter((id) => id !== projectId));
  };

  const handleSubmit = () => {
    onSubmit({
      project_ids: selectedProjectIds,
    });
    onClose();
  };

  return (
    <Modal
      title={"Assign Projects"}
      open={visible}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      width={800}
      // bodyStyle={{ maxHeight: "70vh", overflowY: "auto", paddingBottom: 20 }}
    >
      <Search
        placeholder="Search projects..."
        allowClear
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16, width: 300 }}
      />

      {/* Selected Projects as Tags */}
      {selectedProjects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <strong>Selected Projects:</strong>
          <div style={{ marginTop: 8 }}>
            {selectedProjects.map((project) => (
              <Tag
                key={project.project_id}
                closable
                onClose={() => removeTag(project.project_id)}
                style={{ marginBottom: 8 }}
              >
                {project.project_name}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Project List with Checkboxes */}
      <List
        bordered
        dataSource={filteredProjects}
        renderItem={(project) => (
          <List.Item
            onClick={() => toggleSelection(project.project_id)}
            style={{ cursor: "pointer", paddingLeft: 12 }}
          >
            <Checkbox
              checked={selectedProjectIds.includes(project.project_id)}
              onChange={() => toggleSelection(project.project_id)}
              onClick={() => toggleSelection(project.project_id)}
            >
              <div>
                <strong>{project.project_name}</strong>
                {" - "}
                <small>{project.org_name}</small>
                <br />
                <small>
                  {"Project description: "}
                  {project.project_description}{" "}
                </small>
              </div>
            </Checkbox>
          </List.Item>
        )}
        style={{ maxHeight: "50vh", overflowY: "auto" }}
      />

      {/* Submit Button */}
      <Row justify="end" style={{ marginTop: 24 }}>
        <Col>
          <Button type="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Col>
      </Row>
    </Modal>
  );
};

export default ProjectSelectionModal;
