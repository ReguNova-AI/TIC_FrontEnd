import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Box as MuiBox,
  Button
} from '@mui/material';
import { FileOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import checklist from '../../assets/images/checklist3.jpg';
import assessment from '../../assets/images/assessment2.jpg';
import AssessmentView from './AssessmentView';

const FileCard = ({ fileName, onDownload, onView }) => {
  // Modal open state and active tab state
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Function to handle opening the modal
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const pointsList = [
    'Define battery systems for stationary applications including PV and UPS systems.',
    'Include requirements for batteries used in light electric rail (LER) applications.',
    'Specify vehicle auxiliary power (VAP) battery systems for recreational vehicles.',
    'Ensure compliance with NFPA 70 and C22.1 installation codes.',
    'Exclude traction power batteries from this standard.',
    'Clarify applicability to sodium-beta and flowing electrolyte technologies.',
    'Evaluate systems based on the manufacturer’s specified charge/discharge parameters.',
    'Confirm that performance or reliability is not evaluated under this standard.',
    'Include diagrams illustrating battery system boundaries.',
    'Outline the intended use for energy storage systems.',
    'Ensure all definitions align with industry standards.',
    'Specify that repurposed batteries meet UL 1974 requirements.',
    'Address connections to rail power lines for LER applications.',
    'Provide emergency power specifications for rail cars.',
    'Emphasize the importance of energy balancing during peak hours.'
  ];

  const componentRequirements = [
    'Ensure compliance of components with applicable CSA and UL standards.',
    'Document all components used in the battery system.',
    'Maintain records of the manufacturer’s specifications for components.',
    'Verify that components are suitable for the intended application.',
    'Ensure electrical components comply with relevant electrical safety standards.',
    'Include a list of standards applicable to components.',
    'Validate that components meet requirements for environmental exposure.',
    'Confirm that components are tested for chemical resistance.',
    'Evaluate the compatibility of materials used in construction.',
    'Maintain traceability of all components used in manufacturing.',
    'Assess the performance of components under intended use conditions.',
    'Conduct regular reviews of component standards to ensure compliance.',
    'Document any changes in component specifications.',
    'Ensure that all components are marked accordingly.',
    'Confirm that components used in battery systems are of appropriate quality.'
  ];

  const measurementRequirements = [
    'Use SI units as the primary measurement standard.',
    'Include conversion factors for non-SI units as necessary.',
    'Ensure consistency in measurement units throughout documentation.',
    'Define measurement thresholds clearly.',
    'Confirm that measurement methods are in accordance with industry practices.',
    'Maintain records of measurement equipment calibration.',
    'Specify tolerances for all measurement units used.',
    'Ensure all measurements are traceable to recognized standards.',
    'Include guidelines for reporting measurement results.',
    'Confirm that all personnel are trained in measurement techniques.',
    'Maintain a log of any deviations from standard measurement practices.',
    'Ensure that all measurement equipment is suitable for its intended use.',
    'Review and update measurement procedures regularly.',
    'Document any changes in measurement standards.',
    'Ensure compliance with relevant national and international measurement standards.'
  ];

  const constructionRequirements = [
    'Confirm that non-metallic materials meet flammability standards.',
    'Ensure metallic parts are resistant to corrosion.',
    'Design enclosures to withstand physical abuse.',
    'Maintain proper spacing and separation of electrical circuits.',
    'Ensure adequate insulation levels for electrical components.',
    'Document protective grounding and bonding practices.',
    'Conduct a safety analysis for all battery systems.',
    'Evaluate the effectiveness of protective circuits and controls.',
    'Ensure thermal management systems are reliable and effective.',
    'Document the materials used in electrolyte containment.',
    'Include testing requirements for all battery cell designs.',
    'Confirm that repurposed cells meet safety standards.',
    'Ensure compliance with packaging and transport regulations.',
    'Verify that all components are installed according to specifications.',
    'Document any deviations from construction standards.'
  ];

  const testingRequirements = [
    'Conduct fire hazard evaluations in accordance with specified criteria.',
    'Ensure all tests consider single fault conditions.',
    'Document important considerations for test methodologies.',
    'Evaluate toxic emissions during testing.',
    'Confirm accuracy of measurement equipment used in tests.',
    'Conduct electrical tests on battery systems as specified.',
    'Ensure compliance with thermal stability requirements.',
    'Verify that all battery systems are operational after testing.',
    'Document all test results and compliance criteria.',
    'Ensure that test conditions are controlled and documented.',
    'Confirm that the testing environment is safe and compliant.',
    'Ensure that tests are conducted with fresh samples.',
    'Maintain a log of all test anomalies and corrective actions.',
    'Confirm that test results are reproducible and reliable.',
    'Review and update performance testing protocols regularly.'
  ];

  const safetyFactors = [
    'Material Safety Factor: Ensure materials meet minimum safety ratings.',
    'Electrical Insulation Factor: Confirm insulation levels exceed baseline requirements.',
    'Thermal Safety Factor: Assess thermal stability under maximum operating conditions.',
    'Mechanical Safety Factor: Verify structural integrity under load and impact.',
    'Environmental Safety Factor: Ensure compliance with environmental testing standards.',
    'Chemical Resistance Factor: Confirm materials withstand exposure to electrolytes.',
    'Operational Safety Factor: Validate operational limits for charging and discharging.',
    'Testing Safety Factor: Ensure all tests are conducted with appropriate safety measures.',
    'Component Safety Factor: Confirm all components are tested for reliability and safety.',
    'Overall System Safety Factor: Evaluate the combined safety of all system components and design.'
  ];

  const testRequirements = [
    "Overcharge Test: Evaluate the system's response to excessive charging.",
    'High Rate Charge Test: Assess performance under high current charging conditions.',
    "Short Circuit Test: Determine the system's ability to handle short circuit conditions.",
    'Overload Under Discharge Test: Evaluate performance during excessive discharge currents.',
    'Imbalanced Charging Test: Assess response to uneven charging conditions.',
    'Temperature and Operating Limits Check Test: Verify that systems operate within specified limits.',
    'Electromagnetic Immunity Tests: Ensure protection against electromagnetic interference.',
    'Mechanical Tests: Assess resilience to vibrations, shocks, and impacts.',
    'Environmental Tests: Evaluate performance under various environmental conditions.',
    'Failure of Cooling/Thermal Management System Test: Confirm safety during thermal management failures.',
    'Single Cell Failure Design Tolerance Test: Verify that single cell failures do not propagate.'
  ];

  return (
    <>
      <Card sx={{ width: 200, textAlign: 'center', boxShadow: 3, marginRight: '20px' }}>
        <CardContent style={{ padding: '0px' }}>
          {/* File Icon at the top */}
          <Box sx={{ marginBottom: 1 }}>
            {/* File Icon, adjust based on file type */}
            <img src={fileName === 'Assessment Report' ? assessment : checklist} width="150" alt="File" />
          </Box>

          {/* File Name */}
          <Typography variant="h5" sx={{ marginBottom: 1 }}>
            {fileName}
          </Typography>
        </CardContent>

        {/* Action Buttons (Download and View) */}
        <CardActions sx={{ justifyContent: 'center' }}>
          <IconButton color="primary" onClick={onDownload} aria-label="download">
            <DownloadOutlined />
          </IconButton>
          <IconButton color="primary" onClick={handleOpenModal} aria-label="view">
            <EyeOutlined />
          </IconButton>
        </CardActions>
      </Card>

      {/* Modal Popup */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="lg">
        <DialogTitle>File Details</DialogTitle>
        <DialogContent>
          <MuiBox sx={{ width: '100%' }}>
            {fileName === 'Assessment Report' ? (
              <AssessmentView />
            ) : (
              <>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="file-tabs">
                  {/* Create 5 tabs */}
                  <Tab label="Scope" />
                  <Tab label="Components" />
                  <Tab label="Units of Measurement" />
                  <Tab label="Construction" />
                  <Tab label="Performance" />
                  <Tab label="Summary of Design Load Cases" />
                  <Tab label="Summary of Partial Safety Factors" />
                </Tabs>

                {/* Tab Content */}
                <Box sx={{ padding: 2 }}>
                  {activeTab === 0 && (
                    <Typography>
                      <ul>
                        {pointsList.map((point, index) => (
                          <li key={index}>
                            <Typography>{point}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Typography>
                  )}
                  {activeTab === 1 && (
                    <Typography>
                      <ul>
                        {componentRequirements.map((point, index) => (
                          <li key={index}>
                            <Typography>{point}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Typography>
                  )}
                  {activeTab === 2 && (
                    <Typography>
                      <ul>
                        {measurementRequirements.map((point, index) => (
                          <li key={index}>
                            <Typography>{point}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Typography>
                  )}
                  {activeTab === 3 && (
                    <Typography>
                      <ul>
                        {constructionRequirements.map((point, index) => (
                          <li key={index}>
                            <Typography>{point}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Typography>
                  )}
                  {activeTab === 4 && (
                    <Typography>
                      <ul>
                        {testingRequirements.map((point, index) => (
                          <li key={index}>
                            <Typography>{point}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Typography>
                  )}
                  {activeTab === 5 && (
                    <Typography>
                      <ul>
                        {testRequirements.map((point, index) => (
                          <li key={index}>
                            <Typography>{point}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Typography>
                  )}

                  {activeTab === 6 && (
                    <Typography>
                      <ul>
                        {safetyFactors.map((point, index) => (
                          <li key={index}>
                            <Typography>{point}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </MuiBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileCard;
