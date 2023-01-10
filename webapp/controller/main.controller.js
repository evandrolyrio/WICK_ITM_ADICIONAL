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
		novoItem: function () {
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
						that.getModel("viewModels").setProperty("/Werks", oData.Werks);
						that.getView().getModel("viewModels").setProperty("/AUFNR", oData.Aufnr);
						that.getView().getModel("viewModels").setProperty("/WERKS", oData.Werks);
						that.getView().getModel("viewModels").setProperty("/MATNR", "");
						that.getView().getModel("viewModels").setProperty("/CHARG", "");
						that.getView().getModel("viewModels").setProperty("/ERFMG", "");
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
			var that = this;
			var oModel = this.getModel();
			this.scanHU().then(function(scannedCod) {
				// this._lenum = scannedCod;
				if (scannedCod.substr(14, 10)) {		
					that.getModel("viewModels").setProperty("/WERKS", scannedCod.substr(0, 4));
					that.getModel("viewModels").setProperty("/CHARG", scannedCod.substr(4, 10));
					that.getModel("viewModels").setProperty("/MATNR", scannedCod.substr(14, 10));
				} else {
					oModel.invalidate();
					oModel.callFunction("/Carrinho", {
						method: "GET",
						urlParameters: {
							IdCar: scannedCod,
							Werks: that.getModel("viewModels").getProperty("/WERKS")
						},
						success: function(oData) {
							if (!oData.Matnr) {
								MessageBox.information("ID do carrinho lido não encontrado");
							} else {
								that.getModel("viewModels").setProperty("/WERKS", oData.Werks);
								that.getModel("viewModels").setProperty("/CHARG", oData.Charg);
								that.getModel("viewModels").setProperty("/MATNR", oData.Matnr);									
							}
							
						},
						error: function(error) {
							// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
							// oGeneralModel.setProperty("/sideListBusy", false);
							MessageBox.information("Erro");
							that.getModel("viewModel").setProperty("/busy", false);
						}
					});
				}
				
				
				
	
			});				
			
		},		
		registrar: function() {
			var oModel = this.getModel();
			var that = this;
			this.getModel("viewModel").setProperty("/busy", true);
			oModel.invalidate();
			oModel.callFunction("/Registrar", {
				method: "GET",
				urlParameters: {
					Aufnr: that.getModel("viewModels").getProperty("/AUFNR"),
					Lgort: that.getModel("viewModels").getProperty("/LGORT"),
					Matnr: that.getModel("viewModels").getProperty("/MATNR"),
					Werks: that.getModel("viewModels").getProperty("/WERKS"),
					Charg: that.getModel("viewModels").getProperty("/CHARG"),
					Erfmg: that.getModel("viewModels").getProperty("/ERFMG")
				},
				success: function(oData) {
					if (!oData.Aufnr) {
						MessageBox.information("Material adicional não permitido consumir via FIORI");
						that.getModel("viewModel").setProperty("/busy", false);				
					} else if (!oData.Erfmg) {
						MessageBox.information("A quantidade informada ultrapassa o limite.");
						that.getModel("viewModel").setProperty("/busy", false);						
					} else if (!oData.Matnr) {
						MessageBox.information("Material não expandido para esse centro, verificar.");
						that.getModel("viewModel").setProperty("/busy", false);
					} else if (!oData.Charg){
						MessageBox.information("Lote ou quantidade livre insuficiente, verificar.");
					    that.getModel("viewModel").setProperty("/busy", false);
					} else {
						MessageBox.information("Criado documento: " + oData.Aufnr);
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
		onCloseDialog: function() {
			this.oDialog.close();
			this.oDialog.destroy(true);
		}	

	});
});