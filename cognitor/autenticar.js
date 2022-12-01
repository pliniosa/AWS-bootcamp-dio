import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AmplifyService } from 'aws-amplify-angular';
import { onAuthUIStateChange, CognitoUserInterface, AuthState } from '@aws-amplify/ui-components';
import { Paciente } from 'modelo-paciente';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-entrar',
  templateUrl: './entrar.component.html',
  styleUrls: ['./entrar.component.css']
})

export class EntrarComponent implements OnInit {

  user = {
    login: '',
    senha: ''
  }

  userId: CognitoUserInterface | undefined;
  authState: AuthState | undefined;
  controle = 0;
  email = '';
  code = '';
  senha = '';
  novaSenha = '';
  id = '';
  hide = true;
  spin = false;
  // recebe o id e o email para testar o IF 
  cadastrado = {
    id: '',
    verificador: '',
    role: '',
    zoneinfo: ''
  }

  constructor(
    private amplifyService: AmplifyService,
    private router: Router
  ) {
    this.amplifyService = amplifyService;
    this.amplifyService.authStateChange$.subscribe(authState => {
      console.log(authState)
      this.cadastrado.id = authState.user.username;
      this.cadastrado.role = authState.user.attributes.profile;
      this.cadastrado.zoneinfo = authState.user.attributes.zoneinfo;
      if (authState.state == "signedIn") {
        if (this.cadastrado.role == 'paciente') {
          this.getPaciente();
        } else{
            console.log("error")
        }
      }
    })
  }

  ngOnInit(): void {
    onAuthUIStateChange((authState, authData) => {
      this.authState = authState;
      this.userId = authData as CognitoUserInterface;
      this.ref.detectChanges();
    })
  }

  getPaciente() {
    this.servico.getPaciente(this.cadastrado.id).subscribe((usuario: Paciente) => {
      this.construtorPaciente(usuario);
    })
  }
  construtorPaciente(usuario: Paciente) {
    this.cadastrado.verificador = usuario.id;
    if (this.cadastrado.id == this.cadastrado.verificador) {
      this.router.navigateByUrl('principal');
      
    } else {
      this.router.navigateByUrl('edit-paciente');
      
    }
  }

 //Autenticando
  async signIn() {
    this.loading = true;
    try {
      const autenticado = await Auth.signIn(this.user.login, this.user.senha);
      this.loading = false;
      if (autenticado.Session != null) {
        this.id = autenticado.username;
        this.controle = 3;
      }
    } catch (error: any) { //Tratando os erros de autenticacao do cognito
      this.loading = false;
      console.log('error signing in', error);
      if (error.code == "UserNotConfirmedException"){
          this.openDialogEmail();
      } else if(error.code == "UserNotFoundException"){
          this.openDialogUser();
      } else{
        this.openDialogErro();
      }

    }
  }
  //Auterando a senha
  async novoCodigo() {
    this.loading = true;
    if (this.email != '') {
      Auth.forgotPassword(this.email)
        .then(data => console.log(data))
        .catch(err => console.log(err));
      this.loading = false;
      await setTimeout(()=>{
        this.controle = 2
      },1000)
    }
    
    this.loading = false;
  }
 //Auterando a senha
  novaSenhaCode() {
    this.loading = true;
    if(this.senha == this.novaSenha){
    Auth.forgotPasswordSubmit(this.email, this.code, this.novaSenha)
      .then(data => console.log(data))
      .catch(err => console.log(err));
    this.loading = false;
    this.logar();
    }
  }

  ngOnDestroy() {
    return onAuthUIStateChange;
  }
}
