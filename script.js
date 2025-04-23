async function generatePdf() {
    if (!validateForm()) return;
    
    const data = getFormData();
    
    try {
        // Carregar a fonte padrão (Helvetica)
        const { PDFDocument, StandardFonts, rgb } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        
        // Embed a fonte padrão
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
        
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();
        const fontSize = 12;
        const smallFontSize = 10;
        const titleFontSize = 16;
        
        // Cabeçalho
        page.drawText('Dados da Mercadoria para Transporte', {
            x: 50,
            y: height - 50,
            size: titleFontSize,
            color: rgb(67/255, 97/255, 238/255),
            font: fontBold,
        });
        
        page.drawText(`Gerado em: ${data.generatedAt}`, {
            x: 50,
            y: height - 80,
            size: smallFontSize,
            color: rgb(0.4, 0.4, 0.4),
            font: font,
        });
        
        page.drawText(`Solicitante: ${data.requester}`, {
            x: 50,
            y: height - 100,
            size: smallFontSize,
            color: rgb(0.4, 0.4, 0.4),
            font: font,
        });
        
        // Tabela
        let y = height - 140;
        
        // Cabeçalho da tabela
        page.drawRectangle({
            x: 50,
            y: y - 20,
            width: 500,
            height: 20,
            color: rgb(67/255, 97/255, 238/255),
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
        });
        
        page.drawText('Requisitos', {
            x: 55,
            y: y - 15,
            size: fontSize,
            color: rgb(1, 1, 1),
            font: fontBold,
        });
        
        page.drawText('Resultado', {
            x: 200,
            y: y - 15,
            size: fontSize,
            color: rgb(1, 1, 1),
            font: fontBold,
        });
        
        // Dados da tabela
        const fields = [
            ['Tipo de Frete', data.freightType],
            ['Descrição da mercadoria', data.description],
            ['Quantidade de volumes', data.quantity],
            ['Peso bruto total (kg)', data.weight],
            ['Dimensões dos volumes', data.dimensions],
            ['Valor da mercadoria', `R$ ${data.value}`],
            ['Tipo de carga', data.cargoType + (data.palletQuantity ? ` (${data.palletQuantity} paletes)` : '')],
        ];
        
        if (data.senderName) {
            fields.push(['Razão Social Remetente', data.senderName]);
        }
        
        fields.push(
            [`${data.senderDocType} remetente`, data.senderDoc],
            ['Endereço de coleta', data.pickupAddress]
        );
        
        if (data.receiverName) {
            fields.push(['Razão Social Destinatário', data.receiverName]);
        }
        
        fields.push(
            [`${data.receiverDocType} destinatário`, data.receiverDoc],
            ['Endereço de entrega', data.deliveryAddress]
        );
        
        // Desenhar linhas da tabela
        let fillColor = rgb(0.95, 0.95, 0.95);
        
        for (const [field, value] of fields) {
            // Fundo alternado
            page.drawRectangle({
                x: 50,
                y: y - 40,
                width: 500,
                height: 20,
                color: fillColor,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            
            // Texto
            page.drawText(field, {
                x: 55,
                y: y - 35,
                size: fontSize,
                color: rgb(0, 0, 0),
                font: font,
            });
            
            page.drawText(value, {
                x: 200,
                y: y - 35,
                size: fontSize,
                color: rgb(0, 0, 0),
                font: font,
            });
            
            y -= 20;
            fillColor = fillColor === rgb(0.95, 0.95, 0.95) 
                ? rgb(1, 1, 1) 
                : rgb(0.95, 0.95, 0.95);
        }
        
        // Observações
        if (data.observations) {
            y -= 30;
            
            page.drawText('Observações:', {
                x: 50,
                y: y,
                size: fontSize,
                color: rgb(0, 0, 0),
                font: fontBold,
            });
            
            y -= 20;
            
            // Quebrar texto em várias linhas
            const lines = splitTextIntoLines(data.observations, 80);
            for (const line of lines) {
                page.drawText(line, {
                    x: 50,
                    y: y,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                    font: font,
                });
                y -= 15;
            }
        }
        
        // Rodapé
        y -= 30;
        page.drawText('© Sistema de Gestão de Transportes', {
            x: 50,
            y: y,
            size: smallFontSize,
            color: rgb(0.4, 0.4, 0.4),
            font: fontItalic,
        });
        
        // Salvar PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dados_mercadoria.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('PDF gerado com sucesso!');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Falha ao gerar PDF:\n' + error.message);
    }
}