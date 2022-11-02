//Employe(ID)/Employees1 Id si verilen kişiye rapor verenleri gösteriyor
// Employe(ID)/Employee1  id si verilen kişinin kime rapor verdiği 

/* global moment:true */
sap.ui.define([
  'jquery.sap.global',
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/Fragment"

],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (jQuery, Controller, JSONModel, Filter, FilterOperator, Fragment) {
    "use strict";

    return Controller.extend("com.smod.employeelist.controller.View1", {
      onInit: function () {
        var oViewModel = new JSONModel({
          displayMode: "grid",
          CurrentReportsTo: null,
          Employees: null,
        });
        this.getView().setModel(oViewModel, "empListModel");

      },
      convertImagePath: function (imageData) {
        var sTrimmedData = imageData.substr(104);
        return "data:image/bmp;base64," + sTrimmedData;
      },
      convertImagePath2: function (employeeId) { // Photo yu direkt olarak çektiğimizde undefined  geliyodu asenkron çalışmadan kaynaklı olabilir promise ile çözüldü
        var oModel = this.getView().getModel();
        var sPath = `/Employees(${employeeId})`;
        
        return new Promise(function (resolve, reject) {
          oModel.read(sPath, {
            success: function (oData) {
              resolve(oData);
            },
            error: function () {
              resolve(0);
            },
          });
        }).then(function (oEmployee) {
          var sTrimmedData = oEmployee.Photo.substr(104);
          return "data:image/bmp;base64," + sTrimmedData;
        });
      },
      calculateAge: function (BirthDate) {
        try {
          var fromYear = BirthDate.getFullYear();
          var toYear = new Date().getFullYear();
          console.log(toYear - fromYear);
          return toYear - fromYear;
        } catch (e) {

        }
      },
      ShowGrid: function (oEvent) {
        var oViewModel = this.getView().getModel("empListModel");
        oViewModel.setProperty("/displayMode", "grid");

      },
      ShowTable: function (oEvent) {
        var oViewModel = this.getView().getModel("empListModel");
        oViewModel.setProperty("/displayMode", "table");
      },

      onSearch: function (oEvent) {
        var oGrid = this.getView().byId("EmployeeGridId");
        var oTable = this.getView().byId("EmployeeTableId");
        var aFilter = [];
        var sQuery = oEvent.getParameter("query");
        if (sQuery) {
          aFilter.push(
            new Filter("FirstName", FilterOperator.Contains, sQuery)
          );
        }
        var oBinding = oGrid.getBinding("content");
        oBinding.filter(aFilter);
        var oTableBinding = oTable.getBinding("items");
        oTableBinding.filter(aFilter);
      },
      calculateSeniority: function (Hiredate) {
        try {
          var fromYear = Hiredate.getFullYear();
          var toYear = new Date().getFullYear();
          console.log(toYear - fromYear);
          return toYear - fromYear;


        } catch (e) {

        }
      },
      getEmployeeById: function (employeeId) { // reportsToId
        var oModel = this.getView().getModel();
        var sPath = `/Employees(${employeeId})`;
        var oEmp = oModel.getProperty(sPath);
        return oEmp ? `${oEmp.FirstName} ${oEmp.LastName}` : "";
      },
      getDirectReportsCount: function (employeeId) {
        var oModel = this.getView().getModel();
        var sPath = `/Employees(${employeeId})/Employees1`;

        return new Promise(function (resolve, reject) {
          oModel.read(sPath, {
            success: function (oData) {
              resolve(oData.results.length);
            },
            error: function () {
              resolve(0);
            },
          });
        }).then(function (l) {
          return l > 0 ? l.toString() : "";
        });
      },
      hasDirectReports: function (employeeId) {
        var oModel = this.getView().getModel();
        var sPath = `/Employees(${employeeId})/Employees1`;

        return new Promise(function (resolve, reject) {
          oModel.read(sPath, {
            success: function (oData) {
              resolve(oData.results.length);
            },
            error: function () {
              resolve(0);
            },
          });
        }).then(function (l) {
          return l > 0 ? true : false;
        });
      },
      onPressReportsTo: function (oEvent) {
        var oView = this.getView();
        var oViewModel = oView.getModel("empListModel");
        var oModel = oView.getModel();
        var oLink = oEvent.getSource();
        var reportsToId = oLink.data("ReportsToWho");
        var sPath = `/Employees(${reportsToId})`;
        var sPathForEmployees = `/Employees(${reportsToId})/Employees1`;
        var oEmp = oModel.getProperty(sPath);
        var that = this;
        return new Promise(function (resolve, reject) {
          oModel.read(sPathForEmployees, {
            success: function (oData) {
              resolve(oData.results);
            },
            error: function () {
              resolve(0);
            },
          });
        }).then(function (aEmployess) {

          oViewModel.setProperty("/CurrentReportsTo", oEmp);
          oViewModel.setProperty("/Employees", aEmployess);
          if (!that._oQuickView) {
            that._oQuickView = Fragment.load({
              id: oView.getId(),
              name: "com.smod.employeelist.fragment.ReportsToActions",
              controller: that,
            }).then(
              function (oQuickView) {
                oQuickView.data("ReportsToWho", reportsToId);
                that._oQuickView = oQuickView;

                // to get access to the controller's model
                that.getView().addDependent(that._oQuickView);
                that._oQuickView.setModel(oViewModel);
                that._oQuickView.openBy(oLink);
                return that._oQuickView;
              }.bind(that)
            );
          } else {
            that._oQuickView.data("ReportsToWho", reportsToId);
            that._oQuickView.setModel(oViewModel);
            that._oQuickView.openBy(oLink);
          };
        });


      },

    });
  });
