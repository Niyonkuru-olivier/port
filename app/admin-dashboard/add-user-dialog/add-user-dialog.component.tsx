"use client";

import React, { useState, useEffect } from "react";
import "./add-user-dialog.component.scss";

interface UserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: string;
}

interface AddUserDialogProps {
  userData?: UserData;
  onClose: (data?: UserData) => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ userData, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isEdit, setIsEdit] = useState(false);
  const [user, setUser] = useState<UserData>({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "Activated",
  });

  useEffect(() => {
    if (userData) {
      setIsEdit(true);
      setUser({
        name: userData.name || "",
        email: userData.email || "",
        password: userData.password || "",
        role: userData.role || "",
        status: userData.status || "Active",
      });
    }
  }, [userData]);

  const showStep = (step: number) => setCurrentStep(step);
  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(user);
    }
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>{isEdit ? "Edit User" : "Add New User"}</h2>

        {/* Step Navigation */}
        <div className="steps">
          <div
            className={`step ${currentStep === 1 ? "active" : ""}`}
            onClick={() => showStep(1)}
          >
            Basic Info
          </div>
          <div
            className={`step ${currentStep === 2 ? "active" : ""}`}
            onClick={() => showStep(2)}
          >
            Role
          </div>
        </div>

        {/* Step 1 */}
        {currentStep === 1 && (
          <div>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                placeholder="Enter password"
                required={!isEdit}
              />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div>
            <div className="form-group">
              <label>User Role</label>
              <select
                value={user.role}
                onChange={(e) => setUser({ ...user, role: e.target.value })}
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="actions">
          {currentStep > 1 && (
            <button className="btn" onClick={prevStep}>
              Previous
            </button>
          )}
          <button className="btn primary" onClick={nextStep}>
            {currentStep === 2 ? (isEdit ? "Update" : "Create") : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserDialog;
