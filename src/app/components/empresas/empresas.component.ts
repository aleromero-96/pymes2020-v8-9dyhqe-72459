import { Component, OnInit } from '@angular/core';
import { Empresa } from "../../models/empresa";
import { EmpresasService } from "../../services/empresas.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalDialogService } from "../../services/modal-dialog.service";

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {

  Titulo:String = "Empresas";
  TituloAccionABMC = {
    A: "(Agregar)",
    B: "(Eliminar)",
    M: "(Modificar)",
    C: "(Consultar)",
    L: "(Listado)"
  };
  Empresas: Empresa[] = [];
  empresa: Empresa;
  AccionABMC:string = "L";
    Mensajes = {
    RD: " Revisar los datos ingresados..."
  };
  SinBusquedasRealizadas = true;

  FormReg: FormGroup;
  submitted = false;

  constructor(
    private empresasService:  EmpresasService,
    public formBuilder: FormBuilder,
    private modalDialogService: ModalDialogService
  ) { }

  ngOnInit() {
    this.Buscar();
    this.Resetear();

  }
    Resetear(){
    this.FormReg = this.formBuilder.group({
      IdEmpresa: [0],
      CantidadEmpleados: [null, [Validators.required, Validators.pattern("[0-9]{1,300}")]],
      FechaFundacion: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}"
          )
        ]
      ],
      RazonSocial: [
        "",
        [Validators.required, Validators.minLength(4), Validators.maxLength(55)]
      ],
    });
  }

  Agregar() {
    this.AccionABMC = "A";
    this.Resetear();
    this.FormReg.reset(this.FormReg.value);
    this.submitted = false;
    this.FormReg.markAsUntouched(); 
  }

  Modificar(e) {
    this.submitted = false;
    this.FormReg.markAsPristine();
    this.FormReg.markAsUntouched();
    this.BuscarPorId(e, "M");
  }

  BuscarPorId(e, AccionABMC) {
    window.scroll(0, 0);
    this.empresasService.getById(e.IdEmpresa).subscribe((res: any) => {
      this.FormReg.patchValue(res);

      //formatear fecha de  ISO 8061 a string dd/MM/yyyy
      var arrFecha = res.FechaFundacion.substr(0, 10).split("-");
      this.FormReg.controls.FechaFundacion.patchValue(
        arrFecha[2] + "/" + arrFecha[1] + "/" + arrFecha[0]
      );

      this.AccionABMC = AccionABMC;
    });
  }

  Volver(){
    this.AccionABMC = "L";
  }

Grabar() {
      this.submitted = true;
    // verificar que los validadores esten OK
     if (this.FormReg.invalid) {
      return;
    }

    const itemCopy = { ...this.FormReg.value };

    var arrFecha = itemCopy.FechaFundacion.substr(0, 10).split("/");
    if (arrFecha.length == 3)
      itemCopy.FechaFundacion = 
          new Date(
            arrFecha[2],
            arrFecha[1] - 1,
            arrFecha[0]
          ).toISOString();

    // agregar post
    if (itemCopy.IdEmpresa == 0 || itemCopy.IdEmpresa == null) {
      this.empresasService.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert('Registro agregado correctamente.');
        this.Buscar();
      });
    } else {
      // modificar put
      this.empresasService
        .put(itemCopy.IdEmpresa, itemCopy)
        .subscribe((res: any) => {
          this.Volver();
          this.modalDialogService.Alert('Registro modificado correctamente.');
          this.Buscar();
        });
        }
    }

    Buscar() {
    this.SinBusquedasRealizadas = false;
    this.empresasService
      .get()
      .subscribe((res:Empresa[]) => {
        this.Empresas = res;
      });
    }

    Eliminar(e){
      this.modalDialogService.Confirm(
      "Esta seguro de eliminar esta empresa?",
      undefined,
      undefined,
      undefined,
      () =>
        this.empresasService 
          .delete(e.IdEmpresa)
          .subscribe((res: any) => 
            this.Buscar()
          ),
      null
    );
    }

  Consultar(Dto) {
    this.BuscarPorId(Dto, "C");
  }
}