import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { pdfjs } from 'react-pdf';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import './FAVerForm.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

pdfjs.GlobalWorkerOptions.workerSrc = process.env.PUBLIC_URL + '/pdf.worker.min.js';

const FAVerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    FAV_FileNo: '',
    FAV_VendorName: '',
    FAV_CaseStatus: '',
    FAV_CaseSection: '',
    FAV_ChkParam: '',
    FAV_VerRemark: ''
  });
  const [dropdownItems, setDropdownItems] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [caseSectionData, setCaseSectionData] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const caseSectionRef = useRef(null);
  const chkParamRef = useRef(null);
  const fileInputRef = useRef(null);
  const username = localStorage.getItem('username');
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  useEffect(() => {
    axios.get('http://localhost:5000/api/dropdown-items')
      .then(response => setDropdownItems(response.data))
      .catch(error => console.error('Error fetching dropdown items:', error));
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);
    }
  };

  const handleSaveInitialData = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/save-initial-data', {
      FAV_FileNo: formData.FAV_FileNo,
      FAV_VendorName: formData.FAV_VendorName,
      FAV_CaseStatus: formData.FAV_CaseStatus
    })
    .then(response => {
      toast.success('Data saved successfully!');
      setReadOnly(true);
    })
    .catch(error => {
      console.error('Error saving data:', error);
      toast.error('Error saving data. Please try again.');
    });
  };

  const handleNextPrevious = (direction) => {
    let newIndex = currentSectionIndex + (direction === 'next' ? 1 : -1);
    if (newIndex >= 0 && newIndex < caseSectionData.length) {
      setCurrentSectionIndex(newIndex);
      const section = caseSectionData[newIndex];
      setFormData({ ...formData, FAV_CaseSection: section.FAV_VerSecName, FAV_ChkParam: section.FAV_VerChkParam });
    }
  };

  const handleSaveRemark = () => {
    if (!formData.FAV_VerRemark) {
      toast.error('Please enter a remark.');
      return;
    }
    axios.post('http://localhost:5000/api/save-remark', { FAV_FileNo: formData.FAV_FileNo, FAV_VerRemark: formData.FAV_VerRemark })
    .then(response => {
      toast.success('Remark saved successfully!');
    })
    .catch(error => {
      console.error('Error saving remark:', error);
      toast.error('Error saving remark. Please try again.');
    });
  };

  const handleSubmitCase = () => {
    axios.post('http://localhost:5000/api/submit-case', { FAV_FileNo: formData.FAV_FileNo })
    .then(response => {
      toast.success('Case submitted successfully!');
    })
    .catch(error => {
      console.error('Error submitting case:', error);
      toast.error('Error submitting case. Please try again.');
    });
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  return (
    <div className="page-container">
      <header>
        <div className="user-info">User: {username}</div>
        <div className="date-time">{getCurrentDateTime()}</div>
      </header>
      <div className="split-screen">
        <div className="left-side">
          <h2>Case Verification</h2>
          <form onSubmit={handleSaveInitialData} className="form-container">
            <div className="form-group">
              <label>Form No:</label>
              <input type="text" name="FAV_FileNo" value={formData.FAV_FileNo} onChange={handleInputChange} readOnly={readOnly} required />
            </div>
            <div className="form-group">
              <label>Vendor Name:</label>
              <input type="text" name="FAV_VendorName" value={formData.FAV_VendorName} onChange={handleInputChange} readOnly={readOnly} required />
            </div>
            <div className="form-group">
              <label>Case Status:</label>
              <select name="FAV_CaseStatus" value={formData.FAV_CaseStatus} onChange={handleInputChange} disabled={readOnly} required>
                <option value="">== Select ==</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            {!readOnly && (
              <div className="buttons">
                <button type="submit">Start Verification</button>
              </div>
            )}
          </form>
          {readOnly && (
            <div>
              <div className="form-group">
                <label>Case Section:</label>
                <input type="text" name="FAV_CaseSection" value={formData.FAV_CaseSection} readOnly />
              </div>
              <div className="form-group">
                <label>Check Parameter:</label>
                <input type="text" name="FAV_ChkParam" value={formData.FAV_ChkParam} readOnly />
              </div>
              <div className="buttons">
                <button type="button" onClick={() => handleNextPrevious('previous')}>Previous</button>
                <button type="button" onClick={() => handleNextPrevious('next')}>Next</button>
              </div>
              <div className="form-group">
                <label>Verification Remark:</label>
                <textarea name="FAV_VerRemark" value={formData.FAV_VerRemark} onChange={handleInputChange}></textarea>
              </div>
              <div className="buttons">
                <button type="button" onClick={handleSaveRemark}>Save Remark</button>
              </div>
              <div className="buttons">
                <button type="button" onClick={handleSubmitCase}>Submit Case</button>
              </div>
            </div>
          )}
        </div>
        <div className="right-side">
          <input type="file" accept="application/pdf" onChange={handleFileChange} ref={fileInputRef} />
          {pdfFile && (
            <Worker workerUrl="pdf.worker.min.js">
              <div className="pdf-controls">
                <ZoomInButton />
                <ZoomOutButton />
              </div>
              <Viewer
                fileUrl={pdfFile}
                plugins={[zoomPluginInstance]}
                defaultScale={SpecialZoomLevel.PageFit}
              />
            </Worker>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default FAVerForm;
