"""
Gonzo Story Generator - Hunter S. Thompson style story generator
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import anthropic
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_JUSTIFY
import io

app = Flask(__name__)
CORS(app)

# In-memory storage for story sessions
story_sessions = {}

def get_claude_client():
    """Get Anthropic Claude client"""
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set")
    return anthropic.Anthropic(api_key=api_key)

def generate_gonzo_story(keywords, previous_context="", action="new"):
    """Generate a gonzo story using Claude"""
    client = get_claude_client()

    if action == "new":
        prompt = f"""Du er Hunter S. Thompson reinkarnert. Skriv en rå, intens gonzo-historie basert på disse tre stikkordene: {', '.join(keywords)}.

Stil-krav:
- Skriv som Hunter S. Thompson i hans mest ufiltrerte form
- Bruk vivid, eksplisitt språk (ingen sensur)
- Blande fakta, fiksjon og hallusinasjoner
- Paranoide observasjoner og absurde sammenligninger
- Nevn dop, frykt, galskap og kaos
- Skriv på norsk, men med gonzo-intensitet
- Hold det til 200-300 ord for denne første delen

Begynn historien NÅ - ingen forklaringer, bare ren gonzo-magi."""

    elif action == "continue":
        prompt = f"""Fortsett denne gonzo-historien med samme intensitet og galskap. Øk innsatsen. Mer kaos. Mer frykt.

Forrige del:
{previous_context}

Skriv 150-250 ord til. INGEN SENSUR. Full gonzo."""

    elif action == "twist":
        prompt = f"""Ta denne gonzo-historien i en helt uventet, galere retning. Introduser noe absurd og sjokkerende.

Forrige del:
{previous_context}

Skriv en ny vri på 150-250 ord. Overrask meg. INGEN GRENSER."""

    response = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1500,
        messages=[{
            "role": "user",
            "content": prompt
        }]
    )

    return response.content[0].text

def create_pdf(story_text, keywords):
    """Create a PDF from the story"""
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(buffer, pagesize=letter,
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=18)

    Story = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor='#000000',
        spaceAfter=30,
        alignment=1  # Center
    )

    keyword_style = ParagraphStyle(
        'Keywords',
        parent=styles['Normal'],
        fontSize=12,
        textColor='#666666',
        spaceAfter=20,
        alignment=1  # Center
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        alignment=TA_JUSTIFY,
        spaceAfter=12,
        leading=16
    )

    # Add content
    title = Paragraph("GONZO STORY", title_style)
    Story.append(title)

    kw_text = f"Basert på: {', '.join(keywords)}"
    keywords_para = Paragraph(kw_text, keyword_style)
    Story.append(keywords_para)

    Story.append(Spacer(1, 0.2*inch))

    # Split story into paragraphs
    paragraphs = story_text.split('\n\n')
    for para in paragraphs:
        if para.strip():
            p = Paragraph(para.replace('\n', '<br/>'), body_style)
            Story.append(p)
            Story.append(Spacer(1, 0.1*inch))

    # Add footer
    Story.append(Spacer(1, 0.3*inch))
    footer = Paragraph(
        f"<i>Generert {datetime.now().strftime('%d.%m.%Y kl. %H:%M')}</i>",
        keyword_style
    )
    Story.append(footer)

    doc.build(Story)
    buffer.seek(0)
    return buffer

@app.route('/api/gonzo/generate', methods=['POST'])
def generate():
    """Generate a new gonzo story or continue existing one"""
    try:
        data = request.json
        keywords = data.get('keywords', [])
        session_id = data.get('session_id')
        action = data.get('action', 'new')  # new, continue, twist

        if action == 'new':
            if not keywords or len(keywords) != 3:
                return jsonify({'error': 'Exactly 3 keywords required'}), 400

            # Generate new story
            story = generate_gonzo_story(keywords, action='new')

            # Create new session
            session_id = datetime.now().strftime('%Y%m%d%H%M%S%f')
            story_sessions[session_id] = {
                'keywords': keywords,
                'story_parts': [story],
                'created_at': datetime.now().isoformat()
            }

            return jsonify({
                'session_id': session_id,
                'story': story,
                'keywords': keywords
            })

        else:  # continue or twist
            if not session_id or session_id not in story_sessions:
                return jsonify({'error': 'Invalid session'}), 400

            session = story_sessions[session_id]
            previous_context = '\n\n'.join(session['story_parts'])

            new_part = generate_gonzo_story(
                session['keywords'],
                previous_context=previous_context,
                action=action
            )

            session['story_parts'].append(new_part)

            return jsonify({
                'session_id': session_id,
                'story': new_part,
                'full_story': '\n\n'.join(session['story_parts']),
                'keywords': session['keywords']
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gonzo/pdf/<session_id>', methods=['GET'])
def download_pdf(session_id):
    """Download story as PDF"""
    try:
        if session_id not in story_sessions:
            return jsonify({'error': 'Session not found'}), 404

        session = story_sessions[session_id]
        full_story = '\n\n'.join(session['story_parts'])

        pdf_buffer = create_pdf(full_story, session['keywords'])

        filename = f"gonzo_{'_'.join(session['keywords'])}_{session_id}.pdf"

        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gonzo/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get full story from session"""
    if session_id not in story_sessions:
        return jsonify({'error': 'Session not found'}), 404

    session = story_sessions[session_id]
    return jsonify({
        'session_id': session_id,
        'keywords': session['keywords'],
        'full_story': '\n\n'.join(session['story_parts']),
        'created_at': session['created_at']
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'gonzo-generator'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
