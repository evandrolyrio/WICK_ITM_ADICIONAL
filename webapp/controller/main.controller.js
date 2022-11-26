sap.ui.define([
	"Item/adicionalZPP_ITM_ADICIONAL/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("Item.adicionalZPP_ITM_ADICIONAL.controller.main", {

		onInit: function() {
			this.setModel(new JSONModel({
				busy: false,
				showFooter: false,
				saveEnabled: false,
				hasValidationError: false,
				showToolbars: true
			}), "viewModel");
			
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
    							pattern: "ddMMYY"
				});

			oDateFormat.format(new Date()); //string in the same format as "Thu, Jan 29, 2017"
			
			this.getView().setModel(new JSONModel({
				busy: false,
				AUFNR: "",
				LGORT: "ME",
				MATNR: "",
				WERKS: "",
				CHARG: "",
				ERFMG: "",
			}), "viewModels");			

			this.setModel(this.getOwnerComponent().getModel());
			
			var that = this;
			// this._currentContext = this.getSource().getBindingContext();
			this.oDialog = new sap.ui.xmlfragment("Item.adicionalZPP_ITM_ADICIONAL.view.fragment.DisplayAdicDialog", this);
			if (this.oDialog) {
				this.getView().addDependent(this.oDialog);

				this.oDialog.setModel(this.getModel());
				this.oDialog.setModel(new JSONModel({
					Aufnr: ""
				}, "dialog"));

				this.oDialog.setBindingContext(this._currentContext);
				// this.oDialog.setBindingContext(that);
				this.oDialog.open();
			}						

		},
		goToPass: function(oEvent) {
			var oDialogData = this.oDialog.getModel().getData();
			var that = this;
			this.oDialog.close();
			this.oDialog.destroy(true);
			
			var oModel = this.getModel();
			this.getModel("viewModel").setProperty("/busy", true);
			oModel.invalidate();
			oModel.callFunction("/VerificaOrdem", {
				method: "GET",
				urlParameters: {
					Aufnr: oDialogData.Aufnr
				},
				success: function(oData) {
					if (!oData.Aufnr) {
						MessageBox.information("Não foi possível localizar a ordem informada.");
						that.getModel("viewModel").setProperty("/busy", false);
						that.navigateBack();
					} else {
						that.getModel("viewModels").setProperty("/AUFNR", oData.Aufnr);
						that.getModel("viewModels").setProperty("/Werks", oData.Werks);
						that.getView().getModel("viewModels").setProperty("/AUFNR", oData.Aufnr);
						that.getView().getModel("viewModels").setProperty("/WERKS", oData.Werks);
					    that.getModel("viewModel").setProperty("/busy", false);
					}
				},
				error: function(error) {
					// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
					// oGeneralModel.setProperty("/sideListBusy", false);
					MessageBox.information("Erro");
					that.getModel("viewModel").setProperty("/busy", false);
				}
			});
		},				
		LerCod: function() {
			var oModel = this.getModel();
			this.scanHU().then(function(scannedCod) {
				this._lenum = scannedCod;
						
				this.getModel("viewModels").setProperty("/WERKS", scannedCod.substr(0, 4));
				this.getModel("viewModels").setProperty("/CHARG", scannedCod.substr(4, 10));
				this.getModel("viewModels").setProperty("/MATNR", scannedCod.substr(14, 10));
	
			});				
			
		},		
		confirmAction: function(sMessage, sTitle, fnCallback) {
			sap.m.MessageBox.confirm(sMessage, {
				title: sTitle,
				onClose: fnCallback,
				styleClass: "",
				actions: [sap.m.MessageBox.Action.YES,
					sap.m.MessageBox.Action.CANCEL
				],
				emphasizedAction: sap.m.MessageBox.Action.YES,
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				textDirection: sap.ui.core.TextDirection.Inherit
			});
		},	

	});
});