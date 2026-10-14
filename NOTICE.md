# Avisos e créditos

## Sobre o projeto

O C-RO é um projeto de fã. Não tem vínculo com a Gravity Co., Ltd. nem com a Lee Myoungjin, e não é endossado por eles. "Ragnarok Online" e os elementos da interface do jogo pertencem aos seus titulares.

## O que isso significa para você

O código do kit é MIT e você pode usá-lo livremente. Porém, os pixels de janelas, botões, ícones, barras e cursores foram **derivados da interface do jogo**: foram medidos nos bitmaps originais e reproduzidos em CSS (ficam nos arquivos de `dist/`). Os bitmaps originais não estão neste repositório. Se você usar o kit num projeto comercial ou muito público, avalie por conta própria se esse material derivado é adequado ao seu caso.

Se você é titular de direitos sobre algum desses elementos e quer que ele seja removido, abra uma issue neste repositório.

## Componentes de terceiros

| Componente | Onde | Licença |
|---|---|---|
| Bootstrap 5.3.8 | embutido em `dist/c-ro-bs.*` | MIT |
| Popper | embutido em `dist/c-ro-bs.js` (bundle do Bootstrap) | MIT |
| Nimbus Sans (URW++ base35) | `dist/fonts/` | AGPL-3.0 (texto em `dist/fonts/COPYING-AGPL-3.0.txt`) |

Ao redistribuir os arquivos de fonte, mantenha o aviso `dist/fonts/NOTICE-FONTS.txt` e a licença junto deles.

A **Helvetica** é uma fonte comercial (© Linotype/Apple) e **não** está incluída. O kit usa a Nimbus Sans, um clone métrico livre. Se você tem licença da Helvetica, pode usá-la declarando a sua própria regra `@font-face` e apontando `--cro-font-ui` para ela.

## Referência de aparência

Algumas medidas (raios de borda, cores, espaçamentos) de itens que o jogo não traz em bitmap foram lidas no CSS do [roBrowser](https://github.com/vthibault/roBrowser) como referência de aparência. Nenhum código do roBrowser foi copiado. Esses itens aparecem na documentação marcados como **DERIVADO**.
