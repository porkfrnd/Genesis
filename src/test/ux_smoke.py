from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:4173'


def check(condition, message):
    if not condition:
        raise AssertionError(message)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.goto(BASE, wait_until='networkidle')
    check(page.get_by_role('heading', name='Start with one organism').is_visible(), 'guided first step missing')
    check(page.get_by_role('button', name='Run 10 generations').count() >= 1, 'primary run action missing')
    page.get_by_role('button', name='Open the genome editor').first.click()
    check(page.get_by_role('heading', name='Change one gene. See what follows.').is_visible(), 'genome view missing')
    speed = page.get_by_label('Movement speed allele 2')
    choice = 's' if speed.input_value() == 'S' else 'S'
    speed.select_option(choice)
    check(page.get_by_role('button', name='Apply this change').is_enabled(), 'staged change did not enable')
    page.get_by_role('button', name='Apply this change').click()
    check(page.get_by_text('Genome change applied', exact=False).is_visible(), 'staged change feedback missing')
    page.locator('button.nav-item', has_text='Lab').click()
    page.get_by_role('button', name='Run 10 generations').first.click()
    check(page.get_by_text('GEN', exact=True).count() >= 1, 'generation readout missing')
    page.set_viewport_size({'width': 390, 'height': 844})
    check(page.locator('.experiment-guide').is_visible(), 'mobile guide missing')
    check(not errors, str(errors))
    print('UX smoke passed')
    browser.close()
