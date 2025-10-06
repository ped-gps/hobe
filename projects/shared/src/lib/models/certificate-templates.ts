export const CERTIFICATE_TEMPLATES: { [key: string]: string } = {
	'atestado-medico': `
      <h2 align="center">Atestado Médico</h2>
      <br>
      <p>
        Atesto, para os devidos fins, que o(a) Sr.(ª)
        <strong>{{paciente.nome}}</strong>, portador(a) do CPF nº
        <strong>{{paciente.cpf}}</strong>, esteve sob meus cuidados no dia
        <strong>{{data}}</strong> e permanece impossibilitado(a)
        para suas atividades laborais pelo período de
        <strong>____</strong> dia(s).
      </p>
      <br>
      <p>CID: __________</>
      <br>
      <br>
      <p>Local e data: <strong>{{localData}}</strong></p>
      <br>
      <br>
      <br>
      <br>
      <p align="center">__________________________________</p>
      <p align="center">Assinatura e carimbo</p>
    `.trim(),

	'atestado-comparecimento': `
      <h2 align="center">Atestado de Comparecimento</h2>
      <br>
      <p>
        Atesto, para comprovação, que o(a) Sr.(ª)
        <strong>{{paciente.nome}}</strong>, portador(a) do CPF nº
        <strong>{{paciente.cpf}}</strong>, compareceu a este consultório
        no dia <strong>{{data}}</strong>.
      </p>
      <br>
      <p>Local e data: <strong>{{localData}}</strong></p>
      <br>
      <br>
      <br>
      <br>
      <p align="center">Assinatura e carimbo</p>
    `.trim(),

	'declaracao-saude': `
      <h2 align="center">Declaração de Saúde</h2>
      <br>
      <p>
        Declaro, para os devidos fins, que o(a) Sr.(ª)
        <strong>{{paciente.nome}}</strong>, portador(a) do CPF nº
        <strong>{{paciente.cpf}}</strong>, encontra‑se em bom estado de
        saúde e apto(a) para exercer suas atividades.
      </p>
      <br>
      <p>Local e data: <strong>{{localData}}</strong></p>
      <br>
      <br>
      <br>
      <br>
      <p align="center">Assinatura e carimbo</p>
    `.trim(),

	'laudo-medico': `
      <h2 align="center">Laudo Médico</h2>
      <br>
      <p>Paciente: <strong>{{paciente.nome}}</strong> &nbsp; CPF: <strong>{{paciente.cpf}}</strong></p>
      <p>Data de Atendimento: <strong>{{data}}</strong></p>
      <p>Queixa Principal: ____________________________________________</p>
      <p>Evolução: _________________________________________________</p>
      <p>Conduta: _________________________________________________</p>
      <p>Local e data: <strong>{{localData}}</strong></p>
      <br>
      <br>
      <br>
      <br>
      <p align="center">Assinatura e carimbo</p>
    `.trim(),

	'atestado-incapacidade': `
      <h2 align="center">Atestado de Incapacidade Laboral</h2>
      <br>
      <p>
        Atesto que o(a) Sr.(ª) <strong>{{paciente.nome}}</strong>, CPF nº
        <strong>{{paciente.cpf}}</strong>, encontra‑se incapacitado(a) para
        atividades laborais pelo período de <strong>____</strong> dia(s),
        iniciando em <strong>{{data}}</strong> e término em
        <strong>__/__/___</strong>.
      </p>
      <br>
      <p>Local e data: <strong>{{localData}}</strong></p>
      <br>
      <br>
      <br>
      <br>
      <p align="center">Assinatura e carimbo</p>
    `.trim(),
};
